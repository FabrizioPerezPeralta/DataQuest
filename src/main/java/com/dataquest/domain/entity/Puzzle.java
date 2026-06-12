package com.dataquest.domain.entity;

import com.dataquest.domain.Difficulty;

public class Puzzle {
    private Long id;
    private String statement;
    private String initialTables;
    private String initialFDs;
    private String expectedSolution;
    private Difficulty difficulty;

    public Puzzle(Long id, String statement, String initialTables, String initialFDs,
                  String expectedSolution, Difficulty difficulty) {
        this.id = id;
        this.statement = statement;
        this.initialTables = initialTables;
        this.initialFDs = initialFDs;
        this.expectedSolution = expectedSolution;
        this.difficulty = difficulty;
    }

    public boolean isSolutionCorrect(String userSolution) {
        return expectedSolution != null && expectedSolution.equals(userSolution);
    }

    public Long getId() { return id; }
    public String getStatement() { return statement; }
    public String getInitialTables() { return initialTables; }
    public String getInitialFDs() { return initialFDs; }
    public String getExpectedSolution() { return expectedSolution; }
    public Difficulty getDifficulty() { return difficulty; }
}
