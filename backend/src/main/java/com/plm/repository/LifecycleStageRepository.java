package com.plm.repository;

import com.plm.entity.LifecycleStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LifecycleStageRepository extends JpaRepository<LifecycleStage, Long> {
    List<LifecycleStage> findByProductIdOrderByStageDateAsc(Long productId);
}
