package com.dataquest.domain.entity;

import com.dataquest.domain.Difficulty;

public class LearningLevel {
    private Long id;
    private int world;
    private int levelNumber;
    private String title;
    private String description;
    private String initialSchema;
    private String expectedSolution;
    private String theory;
    private String hints;
    private int xp;
    private Difficulty difficulty;

    public LearningLevel(Long id, int world, int levelNumber, String title, String description,
                         String initialSchema, String expectedSolution, String theory,
                         String hints, int xp, Difficulty difficulty) {
        this.id = id;
        this.world = world;
        this.levelNumber = levelNumber;
        this.title = title;
        this.description = description;
        this.initialSchema = initialSchema;
        this.expectedSolution = expectedSolution;
        this.theory = theory;
        this.hints = hints;
        this.xp = xp;
        this.difficulty = difficulty;
    }

    public boolean isSchemaAnswerCorrect(String userSchema) {
        return expectedSolution != null && expectedSolution.equals(userSchema);
    }

    public Long getId() { return id; }
    public int getWorld() { return world; }
    public int getLevelNumber() { return levelNumber; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getInitialSchema() { return initialSchema; }
    public String getExpectedSolution() { return expectedSolution; }
    public String getTheory() { return theory; }
    public String getHints() { return hints; }
    public int getXp() { return xp; }
    public Difficulty getDifficulty() { return difficulty; }
}
