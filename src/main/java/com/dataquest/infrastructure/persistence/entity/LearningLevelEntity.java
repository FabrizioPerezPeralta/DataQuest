package com.dataquest.infrastructure.persistence.entity;

import com.dataquest.domain.Difficulty;
import jakarta.persistence.*;

@Entity
@Table(name = "learning_levels")
public class LearningLevelEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int world;

    @Column(name = "level_number", nullable = false)
    private int levelNumber;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "initial_schema", columnDefinition = "TEXT")
    private String initialSchema;

    @Column(name = "expected_solution", columnDefinition = "TEXT")
    private String expectedSolution;

    @Column(columnDefinition = "TEXT")
    private String theory;

    @Column(columnDefinition = "TEXT")
    private String hints;

    @Column(nullable = false)
    private Integer xp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Difficulty difficulty;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getWorld() { return world; }
    public void setWorld(int world) { this.world = world; }
    public int getLevelNumber() { return levelNumber; }
    public void setLevelNumber(int levelNumber) { this.levelNumber = levelNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getInitialSchema() { return initialSchema; }
    public void setInitialSchema(String initialSchema) { this.initialSchema = initialSchema; }
    public String getExpectedSolution() { return expectedSolution; }
    public void setExpectedSolution(String expectedSolution) { this.expectedSolution = expectedSolution; }
    public String getTheory() { return theory; }
    public void setTheory(String theory) { this.theory = theory; }
    public String getHints() { return hints; }
    public void setHints(String hints) { this.hints = hints; }
    public Integer getXp() { return xp; }
    public void setXp(Integer xp) { this.xp = xp; }
    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }
}
