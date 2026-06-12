package com.dataquest.infrastructure.persistence.repository;

import com.dataquest.infrastructure.persistence.entity.RetoSemanalEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataRetoSemanalRepository extends JpaRepository<RetoSemanalEntity, Long> {
}
