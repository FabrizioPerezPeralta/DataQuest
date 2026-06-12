package com.dataquest.infrastructure.persistence.repository;

import com.dataquest.infrastructure.persistence.entity.WorkspaceMemberEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SpringDataWorkspaceMemberRepository extends JpaRepository<WorkspaceMemberEntity, Long> {
    List<WorkspaceMemberEntity> findByWorkspaceId(Long workspaceId);
    Optional<WorkspaceMemberEntity> findByWorkspaceIdAndUserId(Long workspaceId, Long userId);
    List<WorkspaceMemberEntity> findByUserId(Long userId);
}
