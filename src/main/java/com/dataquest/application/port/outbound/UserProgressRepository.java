package com.dataquest.application.port.outbound;

import com.dataquest.domain.entity.UserProgress;
import java.util.List;
import java.util.Optional;

public interface UserProgressRepository {
    Optional<UserProgress> findByUserIdAndLevelId(Long userId, Long levelId);
    List<UserProgress> findByUserId(Long userId);
    UserProgress save(UserProgress progress);
}
