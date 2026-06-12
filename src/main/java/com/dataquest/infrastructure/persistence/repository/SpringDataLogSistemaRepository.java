package com.dataquest.infrastructure.persistence.repository;

import com.dataquest.infrastructure.persistence.entity.LogSistemaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpringDataLogSistemaRepository extends JpaRepository<LogSistemaEntity, Long> {
    List<LogSistemaEntity> findAllByOrderByCreatedAtDesc();
}
