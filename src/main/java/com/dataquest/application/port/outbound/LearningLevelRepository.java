package com.dataquest.application.port.outbound;

import com.dataquest.domain.entity.LearningLevel;
import java.util.List;
import java.util.Optional;

public interface LearningLevelRepository {
    Optional<LearningLevel> findById(Long id);
    List<LearningLevel> findAllByOrderByWorldAscLevelNumberAsc();
}
