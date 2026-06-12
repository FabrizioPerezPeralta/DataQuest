package com.dataquest.domain.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class StarCalculationServiceTest {

    private final StarCalculationService service = new StarCalculationService();

    @Test
    void testZeroAttemptsGivesZeroStars() {
        assertEquals(0, service.calculateStars(0, 0));
    }

    @Test
    void testPerfectScoreFirstAttemptGivesThreeStars() {
        assertEquals(3, service.calculateStars(1, 100));
    }

    @Test
    void testGoodScoreSecondAttemptGivesTwoStars() {
        assertEquals(2, service.calculateStars(2, 85));
    }

    @Test
    void testLowScoreGivesZeroStars() {
        assertEquals(0, service.calculateStars(5, 30));
    }

    @Test
    void testXpStreakBonus() {
        int xp = service.calculateXP(100, 1, false, 5);
        assertTrue(xp > 100);
    }

    @Test
    void testXpHintPenalty() {
        int xpNoHint = service.calculateXP(100, 1, false, 0);
        int xpHint = service.calculateXP(100, 1, true, 0);
        assertTrue(xpHint < xpNoHint);
    }
}
