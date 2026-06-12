package com.dataquest.domain.service;

import com.dataquest.domain.MedalConditionType;
import com.dataquest.domain.entity.Medal;
import com.dataquest.domain.entity.UserMedal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MedalEvaluationService {

    public List<Medal> evaluateNewMedals(List<Medal> allMedals, List<UserMedal> ownedMedals,
                                         int puzzlesSolved, int retosCompleted, int totalXP) {
        List<Medal> newMedals = new ArrayList<>();
        for (Medal medal : allMedals) {
            boolean alreadyOwned = ownedMedals.stream()
                .anyMatch(um -> um.getMedalId().equals(medal.getId()));
            if (alreadyOwned) continue;

            boolean earned = switch (medal.getConditionType()) {
                case PUZZLES_SOLVED -> medal.isEarned(puzzlesSolved);
                case RETOS_COMPLETED -> medal.isEarned(retosCompleted);
                case XP_REACHED -> medal.isEarned(totalXP);
            };

            if (earned) {
                newMedals.add(medal);
            }
        }
        return newMedals;
    }
}
