package com.dataquest.application.dto;

import java.util.List;

public record DashboardResponse(
    int totalXP,
    int totalStars,
    int completedLevels,
    int streakDays,
    int rank,
    List<String> medals,
    List<ActivityEntry> recentActivity
) {
    public record ActivityEntry(
        String type,
        String description,
        String timestamp
    ) {}
}
