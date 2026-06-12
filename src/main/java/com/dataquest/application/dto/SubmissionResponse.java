package com.dataquest.application.dto;

public record SubmissionResponse(
    boolean success,
    boolean correct,
    @com.fasterxml.jackson.annotation.JsonProperty("score_earned") int xpEarned,
    @com.fasterxml.jackson.annotation.JsonProperty("stars") int starsEarned,
    int totalXP,
    String message,
    java.util.List<String> newMedals
) {
    public static SubmissionResponse correct(int xp, int stars, int totalXP, String message,
                                             java.util.List<String> newMedals) {
        return new SubmissionResponse(true, true, xp, stars, totalXP, message, newMedals);
    }

    public static SubmissionResponse incorrect(String message) {
        return new SubmissionResponse(true, false, 0, 0, 0, message, java.util.List.of());
    }
}
