package com.plm.service;

import com.plm.dto.*;
import com.plm.entity.Material;
import com.plm.entity.Product;
import com.plm.entity.ProductMaterial;
import com.plm.entity.User;
import com.plm.exception.BadRequestException;
import com.plm.exception.ResourceNotFoundException;
import com.plm.repository.MaterialRepository;
import com.plm.repository.ProductMaterialRepository;
import com.plm.repository.ProductRepository;
import com.plm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMaterialRepository productMaterialRepository;
    private final MaterialRepository materialRepository;
    private final UserRepository userRepository;
    private final ScoringService scoringService;

    public User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
            return userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
        }
        // Fallback for testing prior to JWT security filter in Phase 8
        return userRepository.findByEmail("mani@plm.local")
                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No active user found in database")));
    }

    @Transactional
    public ProductResponseDto createProduct(ProductRequestDto dto) {
        User user = getAuthenticatedUser();

        // 1. Validate against duplicate material rows
        Set<Long> seenMaterialIds = new HashSet<>();
        for (ProductMaterialRequestDto row : dto.getMaterials()) {
            if (!seenMaterialIds.add(row.getMaterialId())) {
                throw new BadRequestException("Duplicate material detected in product definition. Please combine weights into a single row.");
            }
        }

        // 2. Batch-fetch all materials from DB in one query (fixes N+1)
        List<Long> materialIds = dto.getMaterials().stream()
                .map(ProductMaterialRequestDto::getMaterialId)
                .collect(Collectors.toList());
        List<Material> materials = materialRepository.findAllById(materialIds);
        Map<Long, Material> materialCache = materials.stream()
                .collect(Collectors.toMap(Material::getId, m -> m));

        // Validate all materials were found
        for (Long mid : materialIds) {
            if (!materialCache.containsKey(mid)) {
                throw new ResourceNotFoundException("Material not found with id: " + mid);
            }
        }

        List<MaterialScoreItem> scoreItems = dto.getMaterials().stream()
                .map(row -> new MaterialScoreItem(materialCache.get(row.getMaterialId()), row.getWeightG()))
                .collect(Collectors.toList());

        // 3. Compute real-time score
        ScoreCalculationResult calcResult = scoringService.calculate(scoreItems);

        // 4. Save Product
        Product product = Product.builder()
                .user(user)
                .name(dto.getName())
                .category(dto.getCategory())
                .totalWeightG(calcResult.getTotalWeightG())
                .score(calcResult.getScore())
                .label(calcResult.getLabel())
                .build();

        Product savedProduct = productRepository.save(product);

        // 5. Batch-save all ProductMaterial rows in one operation (fixes N+1 writes)
        List<ProductMaterial> pmList = dto.getMaterials().stream()
                .map(row -> ProductMaterial.builder()
                        .product(savedProduct)
                        .material(materialCache.get(row.getMaterialId()))
                        .weightG(row.getWeightG())
                        .build())
                .collect(Collectors.toList());
        productMaterialRepository.saveAll(pmList);

        return toResponseDto(savedProduct, calcResult);
    }

    @Transactional(readOnly = true)
    public List<ProductSummaryDto> getUserProducts() {
        User user = getAuthenticatedUser();
        return productRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(Long id) {
        User user = getAuthenticatedUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Ownership check
        if (!product.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("You do not have permission to view this product");
        }

        // Recompute real-time breakdown details
        List<ProductMaterial> pmList = productMaterialRepository.findByProductId(id);
        List<MaterialScoreItem> items = pmList.stream()
                .map(pm -> new MaterialScoreItem(pm.getMaterial(), pm.getWeightG()))
                .collect(Collectors.toList());

        ScoreCalculationResult calcResult = scoringService.calculate(items);
        return toResponseDto(product, calcResult);
    }

    @Transactional
    public ProductResponseDto updateProduct(Long id, ProductRequestDto dto) {
        User user = getAuthenticatedUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("You do not have permission to edit this product");
        }

        // Validate duplicates
        Set<Long> seenMaterialIds = new HashSet<>();
        for (ProductMaterialRequestDto row : dto.getMaterials()) {
            if (!seenMaterialIds.add(row.getMaterialId())) {
                throw new BadRequestException("Duplicate material detected in product definition.");
            }
        }

        // Remove old rows with single bulk DELETE statement (instead of N individual DELETEs)
        List<ProductMaterial> existing = productMaterialRepository.findByProductId(id);
        productMaterialRepository.deleteAllInBatch(existing);
        productMaterialRepository.flush();

        // Batch-fetch all materials in one query (fixes N+1)
        List<Long> materialIds = dto.getMaterials().stream()
                .map(ProductMaterialRequestDto::getMaterialId)
                .collect(Collectors.toList());
        List<Material> materials = materialRepository.findAllById(materialIds);
        Map<Long, Material> materialCache = materials.stream()
                .collect(Collectors.toMap(Material::getId, m -> m));

        for (Long mid : materialIds) {
            if (!materialCache.containsKey(mid)) {
                throw new ResourceNotFoundException("Material not found with id: " + mid);
            }
        }

        List<MaterialScoreItem> scoreItems = dto.getMaterials().stream()
                .map(row -> new MaterialScoreItem(materialCache.get(row.getMaterialId()), row.getWeightG()))
                .collect(Collectors.toList());

        ScoreCalculationResult calcResult = scoringService.calculate(scoreItems);

        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setTotalWeightG(calcResult.getTotalWeightG());
        product.setScore(calcResult.getScore());
        product.setLabel(calcResult.getLabel());

        Product updatedProduct = productRepository.save(product);

        // Batch-save all ProductMaterial rows (fixes N+1 writes)
        List<ProductMaterial> newPmList = dto.getMaterials().stream()
                .map(row -> ProductMaterial.builder()
                        .product(updatedProduct)
                        .material(materialCache.get(row.getMaterialId()))
                        .weightG(row.getWeightG())
                        .build())
                .collect(Collectors.toList());
        productMaterialRepository.saveAll(newPmList);

        return toResponseDto(updatedProduct, calcResult);
    }

    @Transactional
    public void deleteProduct(Long id) {
        User user = getAuthenticatedUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("You do not have permission to delete this product");
        }

        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public void exportProductsCsv(PrintWriter writer) {
        User user = getAuthenticatedUser();
        List<Product> products = productRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        writer.println("Product ID,Product Name,Category,Total Weight (g),Score,Label,Created Date");

        for (Product p : products) {
            writer.printf("%d,\"%s\",\"%s\",%.1f,%.1f,%s,%s%n",
                    p.getId(),
                    p.getName().replace("\"", "\"\""),
                    p.getCategory().replace("\"", "\"\""),
                    p.getTotalWeightG(),
                    p.getScore(),
                    p.getLabel(),
                    DateTimeFormatter.ISO_INSTANT.format(p.getCreatedAt())
            );
        }
        writer.flush();
    }

    private ProductSummaryDto toSummaryDto(Product p) {
        return ProductSummaryDto.builder()
                .id(p.getId())
                .name(p.getName())
                .category(p.getCategory())
                .totalWeightG(p.getTotalWeightG())
                .score(p.getScore())
                .label(p.getLabel())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private ProductResponseDto toResponseDto(Product p, ScoreCalculationResult calc) {
        return ProductResponseDto.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .name(p.getName())
                .category(p.getCategory())
                .totalWeightG(p.getTotalWeightG())
                .score(p.getScore())
                .label(p.getLabel())
                .createdAt(p.getCreatedAt())
                .calculationResult(calc)
                .build();
    }
}
