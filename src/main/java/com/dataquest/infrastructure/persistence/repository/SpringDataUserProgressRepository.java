package com.dataquest.infrastructure.persistence.repository;

import com.dataquest.infrastructure.persistence.entity.UserProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpringDataUserProgressRepository extends JpaRepository<UserProgressEntity, Long> {
    List<UserProgressEntity> findByUserId(Long userId);
    Optional<UserProgressEntity> findByUserIdAndLevelId(Long userId, Long levelId);
}
