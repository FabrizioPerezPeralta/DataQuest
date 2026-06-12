package com.dataquest.infrastructure.persistence.mapper;

import com.dataquest.domain.entity.LearningLevel;
import com.dataquest.infrastructure.persistence.entity.LearningLevelEntity;
import org.springframework.stereotype.Component;

@Component
public class LearningLevelMapper {

    public LearningLevel toDomain(LearningLevelEntity entity) {
        if (entity == null) return null;
        return new LearningLevel(
            entity.getId(), entity.getWorld(), entity.getLevelNumber(),
            entity.getTitle(), entity.getDescription(),
            entity.getInitialSchema(), entity.getExpectedSolution(),
            entity.getTheory(), entity.getHints(),
            entity.getXp(), entity.getDifficulty()
        );
    }
}
