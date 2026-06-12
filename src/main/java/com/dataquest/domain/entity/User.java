package com.dataquest.domain.entity;

import com.dataquest.domain.UserRole;
import java.time.LocalDateTime;

public class User {
    private Long id;
    private String email;
    private String nickname;
    private String passwordHash;
    private UserRole role;
    private boolean active;
    private LocalDateTime registrationDate;
    private LocalDateTime lastConnection;
    private int streakDays;
    private LocalDateTime lastStreak;
    private String sessionToken;
    private LocalDateTime deletedAt;

    public User(Long id, String email, String nickname, String passwordHash, UserRole role) {
        this.id = id;
        this.email = email;
        this.nickname = nickname;
        this.passwordHash = passwordHash;
        this.role = role;
        this.active = true;
        this.registrationDate = LocalDateTime.now();
        this.lastConnection = LocalDateTime.now();
        this.streakDays = 0;
    }

    public boolean isAdmin() {
        return UserRole.ADMIN.equals(this.role);
    }

    public boolean isActive() {
        return active && deletedAt == null;
    }

    public void markDeleted() {
        this.deletedAt = LocalDateTime.now();
    }

    public void updateLastConnection() {
        this.lastConnection = LocalDateTime.now();
    }

    public void updateStreak() {
        if (lastStreak != null && lastStreak.toLocalDate().equals(LocalDateTime.now().toLocalDate().minusDays(1))) {
            this.streakDays++;
        } else if (lastStreak == null || !lastStreak.toLocalDate().equals(LocalDateTime.now().toLocalDate())) {
            this.streakDays = 1;
        }
        this.lastStreak = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getNickname() { return nickname; }
    public String getPasswordHash() { return passwordHash; }
    public UserRole getRole() { return role; }
    public boolean getActive() { return active; }
    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public LocalDateTime getLastConnection() { return lastConnection; }
    public int getStreakDays() { return streakDays; }
    public LocalDateTime getLastStreak() { return lastStreak; }
    public String getSessionToken() { return sessionToken; }
    public LocalDateTime getDeletedAt() { return deletedAt; }

    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setSessionToken(String sessionToken) { this.sessionToken = sessionToken; }
}
