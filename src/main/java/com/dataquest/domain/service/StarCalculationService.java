package com.dataquest.domain.service;

public class StarCalculationService {

    public int calculateStars(int attempts, int score) {
        if (attempts <= 0) return 0;
        if (attempts == 1 && score >= 100) return 3;
        if (attempts <= 2 && score >= 80) return 2;
        if (attempts <= 3 && score >= 50) return 1;
        return 0;
    }

    public int calculateXP(int baseXP, int attempts, boolean usedHints, int streakDays) {
        double multiplier = 1.0;
        if (attempts == 1) multiplier = 1.5;
        else if (attempts == 2) multiplier = 1.2;
        else if (attempts >= 3) multiplier = 0.8;

        if (usedHints) multiplier -= 0.3;
        if (streakDays > 0) multiplier += Math.min(streakDays * 0.05, 0.5);

        return (int) Math.round(baseXP * Math.max(multiplier, 0.1));
    }
}
