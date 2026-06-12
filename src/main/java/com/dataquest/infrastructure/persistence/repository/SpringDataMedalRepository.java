package com.dataquest.infrastructure.persistence.repository;

import com.dataquest.infrastructure.persistence.entity.MedalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpringDataMedalRepository extends JpaRepository<MedalEntity, Long> {
}
