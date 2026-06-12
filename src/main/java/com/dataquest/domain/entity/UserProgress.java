package com.dataquest.domain.entity;

import java.time.LocalDateTime;

public class UserProgress {
    private Long id;
    private Long userId;
    private Long levelId;
    private int starsEarned;
    private int score;
    private int attempts;
    private LocalDateTime completedAt;

    public UserProgress(Long id, Long userId, Long levelId) {
        this.id = id;
        this.userId = userId;
        this.levelId = levelId;
        this.starsEarned = 0;
        this.score = 0;
        this.attempts = 0;
    }

    public UserProgress(Long id, Long userId, Long levelId, int starsEarned, int score, int attempts, LocalDateTime completedAt) {
        this.id = id;
        this.userId = userId;
        this.levelId = levelId;
        this.starsEarned = starsEarned;
        this.score = score;
        this.attempts = attempts;
        this.completedAt = completedAt;
    }

    public void recordAttempt(int score, int stars) {
        this.attempts++;
        if (score > this.score) {
            this.score = score;
        }
        if (stars > this.starsEarned) {
            this.starsEarned = stars;
        }
        this.completedAt = LocalDateTime.now();
    }

    public int calculateStarRating() {
        if (attempts == 0) return 0;
        if (attempts <= 1 && score >= 100) return 3;
        if (attempts <= 2 && score >= 80) return 2;
        return 1;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public Long getLevelId() { return levelId; }
    public int getStarsEarned() { return starsEarned; }
    public int getScore() { return score; }
    public int getAttempts() { return attempts; }
    public LocalDateTime getCompletedAt() { return completedAt; }
}
