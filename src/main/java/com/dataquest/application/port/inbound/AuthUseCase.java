package com.dataquest.application.port.inbound;

import com.dataquest.application.dto.AuthRequest;
import com.dataquest.application.dto.AuthResponse;
import com.dataquest.application.dto.UserRegistrationRequest;

public interface AuthUseCase {
    AuthResponse register(UserRegistrationRequest request);
    AuthResponse login(AuthRequest request);
    AuthResponse createGuestSession();
    void logout(Long userId);
    void changePassword(Long userId, String currentPassword, String newPassword);
    boolean validateToken(String token);
    AuthResponse getCurrentUser(Long userId);
}
