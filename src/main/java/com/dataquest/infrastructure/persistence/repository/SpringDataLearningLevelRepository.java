package com.dataquest.infrastructure.persistence.repository;

import com.dataquest.infrastructure.persistence.entity.LearningLevelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataLearningLevelRepository extends JpaRepository<LearningLevelEntity, Long> {
    List<LearningLevelEntity> findAllByOrderByWorldAscLevelNumberAsc();
}
