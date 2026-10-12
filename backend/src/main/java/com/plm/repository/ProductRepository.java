package com.plm.repository;

import com.plm.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndLabel(Long userId, String label);
}
