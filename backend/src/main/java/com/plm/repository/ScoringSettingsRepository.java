package com.plm.repository;

import com.plm.entity.ScoringSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScoringSettingsRepository extends JpaRepository<ScoringSettings, Long> {
    Optional<ScoringSettings> findFirstByOrderByIdAsc();
}
