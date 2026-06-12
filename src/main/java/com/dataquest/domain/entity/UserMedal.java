package com.dataquest.domain.entity;

import java.time.LocalDateTime;

public class UserMedal {
    private Long id;
    private Long userId;
    private Long medalId;
    private LocalDateTime earnedAt;

    public UserMedal(Long id, Long userId, Long medalId) {
        this.id = id;
        this.userId = userId;
        this.medalId = medalId;
        this.earnedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getMedalId() { return medalId; }
    public LocalDateTime getEarnedAt() { return earnedAt; }
}
