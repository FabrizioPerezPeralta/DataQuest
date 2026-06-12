package com.dataquest.infrastructure.persistence.repository;

import com.dataquest.infrastructure.persistence.entity.PuzzleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataPuzzleRepository extends JpaRepository<PuzzleEntity, Long> {
}
