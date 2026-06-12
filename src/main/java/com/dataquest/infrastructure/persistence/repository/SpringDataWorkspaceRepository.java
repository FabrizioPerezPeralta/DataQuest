package com.dataquest.infrastructure.persistence.repository;

import com.dataquest.infrastructure.persistence.entity.WorkspaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SpringDataWorkspaceRepository extends JpaRepository<WorkspaceEntity, Long> {
    List<WorkspaceEntity> findByOwnerIdOrderByUpdatedAtDesc(Long ownerId);
}
