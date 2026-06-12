package com.dataquest.infrastructure.persistence.mapper;

import com.dataquest.domain.entity.UserProgress;
import com.dataquest.infrastructure.persistence.entity.UserProgressEntity;
import org.springframework.stereotype.Component;

@Component
public class UserProgressMapper {

    public UserProgress toDomain(UserProgressEntity entity) {
        if (entity == null) return null;
        return new UserProgress(
            entity.getId(), entity.getUserId(), entity.getLevelId(),
            entity.getStarsEarned(), entity.getScore(),
            entity.getAttempts(), entity.getCompletedAt()
        );
    }

    public UserProgressEntity toEntity(UserProgress domain) {
        if (domain == null) return null;
        UserProgressEntity entity = new UserProgressEntity();
        entity.setId(domain.getId());
        entity.setUserId(domain.getUserId());
        entity.setLevelId(domain.getLevelId());
        entity.setStarsEarned(domain.getStarsEarned());
        entity.setScore(domain.getScore());
        entity.setAttempts(domain.getAttempts());
        entity.setCompletedAt(domain.getCompletedAt());
        return entity;
    }
}
