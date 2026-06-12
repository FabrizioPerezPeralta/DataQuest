package com.dataquest.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workspaces")
public class WorkspaceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "title", length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String schemaData;

    @Column(columnDefinition = "TEXT")
    private String dependencies;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "typing_user_id")
    private Long typingUserId;

    @Column(name = "typing_at")
    private LocalDateTime typingAt;

    @Column(name = "last_action_user_id")
    private Long lastActionUserId;

    @Column(name = "last_action_text", columnDefinition = "TEXT")
    private String lastActionText;

    public WorkspaceEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSchemaData() { return schemaData; }
    public void setSchemaData(String schemaData) { this.schemaData = schemaData; }
    public String getDependencies() { return dependencies; }
    public void setDependencies(String dependencies) { this.dependencies = dependencies; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Long getTypingUserId() { return typingUserId; }
    public void setTypingUserId(Long typingUserId) { this.typingUserId = typingUserId; }
    public LocalDateTime getTypingAt() { return typingAt; }
    public void setTypingAt(LocalDateTime typingAt) { this.typingAt = typingAt; }
    public Long getLastActionUserId() { return lastActionUserId; }
    public void setLastActionUserId(Long lastActionUserId) { this.lastActionUserId = lastActionUserId; }
    public String getLastActionText() { return lastActionText; }
    public void setLastActionText(String lastActionText) { this.lastActionText = lastActionText; }
}
