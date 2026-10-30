package com.plm.repository;

import com.plm.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndLabel(Long userId, String label);

    @Query("SELECT p FROM Product p JOIN FETCH p.user WHERE p.id = :id")
    Optional<Product> findByIdWithUser(@Param("id") Long id);
}
