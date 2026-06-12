package com.dataquest.infrastructure.persistence.repository;

import com.dataquest.infrastructure.persistence.entity.UserMedalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpringDataUserMedalRepository extends JpaRepository<UserMedalEntity, Long> {
    List<UserMedalEntity> findByUserId(Long userId);
}
