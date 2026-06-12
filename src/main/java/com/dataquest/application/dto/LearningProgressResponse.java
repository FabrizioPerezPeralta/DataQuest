package com.dataquest.application.dto;

import java.util.List;

public record LearningProgressResponse(
    long userId,
    int totalXP,
    int totalStars,
    int completedLevels,
    int streakDays,
    List<LevelProgress> levels
) {
    public record LevelProgress(
        Long levelId,
        String title,
        int world,
        int stars,
        boolean completed
    ) {}
}
