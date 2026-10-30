package com.plm.repository;

import com.plm.entity.ProductMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductMaterialRepository extends JpaRepository<ProductMaterial, Long> {
    @Query("SELECT pm FROM ProductMaterial pm JOIN FETCH pm.material WHERE pm.product.id = :productId")
    List<ProductMaterial> findByProductId(@Param("productId") Long productId);
}
