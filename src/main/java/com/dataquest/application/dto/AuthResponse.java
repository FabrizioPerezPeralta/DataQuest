package com.dataquest.application.dto;

public record AuthResponse(
    boolean success,
    String token,
    Long userId,
    String nickname,
    String role,
    String error
) {
    public static AuthResponse ok(String token, Long userId, String nickname, String role) {
        return new AuthResponse(true, token, userId, nickname, role, null);
    }

    public static AuthResponse error(String message) {
        return new AuthResponse(false, null, null, null, null, message);
    }
}
