package com.plm.repository;

import com.plm.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    Optional<Material> findByName(String name);
    boolean existsByName(String name);

    @Query("SELECT m FROM Material m LEFT JOIN FETCH m.source ORDER BY m.name ASC")
    List<Material> findAllByOrderByNameAsc();
}
