package com.dataquest.application.service;

import com.dataquest.application.dto.AuthRequest;
import com.dataquest.application.dto.AuthResponse;
import com.dataquest.application.dto.UserRegistrationRequest;
import com.dataquest.application.port.inbound.AuthUseCase;
import com.dataquest.application.port.outbound.UserRepository;
import com.dataquest.domain.entity.User;
import com.dataquest.domain.service.RateLimiterService;
import com.dataquest.domain.UserRole;
import com.dataquest.domain.valueobject.Email;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService implements AuthUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RateLimiterService rateLimiter;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       RateLimiterService rateLimiter) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.rateLimiter = rateLimiter;
    }

    @Override
    @Transactional
    public AuthResponse register(UserRegistrationRequest request) {
        String ipKey = extractClientIp();
        if (!rateLimiter.isAllowed(ipKey)) {
            return AuthResponse.error("Demasiados intentos. Intente en 15 minutos.");
        }

        try {
            new Email(request.email());
        } catch (IllegalArgumentException e) {
            return AuthResponse.error("Email inválido.");
        }

        if (userRepository.existsByEmail(request.email())) {
            rateLimiter.recordAttempt(ipKey);
            return AuthResponse.error("El email ya está registrado.");
        }

        User user = new User(
            null, request.email(), request.nickname(),
            passwordEncoder.encode(request.password()), UserRole.USER
        );
        user = userRepository.save(user);

        rateLimiter.recordAttempt(ipKey);
        return AuthResponse.ok("guest-token", user.getId(), user.getNickname(), user.getRole().name());
    }

    @Override
    @Transactional
    public AuthResponse login(AuthRequest request) {
        String ipKey = extractClientIp();
        if (!rateLimiter.isAllowed(ipKey)) {
            return AuthResponse.error("Demasiados intentos. Intente en 15 minutos.");
        }

        var userOpt = userRepository.findByEmail(request.email());
        if (userOpt.isEmpty()) {
            rateLimiter.recordAttempt(ipKey);
            return AuthResponse.error("Credenciales inválidas.");
        }

        User user = userOpt.get();
        if (!user.isActive()) {
            return AuthResponse.error("Cuenta desactivada.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            rateLimiter.recordAttempt(ipKey);
            return AuthResponse.error("Credenciales inválidas.");
        }

        user.updateLastConnection();
        user.updateStreak();
        userRepository.save(user);

        String token = "jwt-token-" + user.getId(); // Placeholder - real JWT in security layer
        return AuthResponse.ok(token, user.getId(), user.getNickname(), user.getRole().name());
    }

    @Override
    @Transactional
    public AuthResponse createGuestSession() {
        User guest = new User(
            null, "guest-" + System.currentTimeMillis() + "@dataquest.local",
            "Invitado", passwordEncoder.encode("guest"), UserRole.GUEST
        );
        guest = userRepository.save(guest);
        return AuthResponse.ok("guest-token", guest.getId(), guest.getNickname(), guest.getRole().name());
    }

    @Override
    @Transactional
    public void logout(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setSessionToken(null);
            userRepository.save(user);
        });
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        var user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Contraseña actual incorrecta");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public AuthResponse getCurrentUser(Long userId) {
        return userRepository.findById(userId)
            .map(user -> AuthResponse.ok(null, user.getId(), user.getNickname(), user.getRole().name()))
            .orElse(AuthResponse.error("Usuario no encontrado"));
    }

    @Override
    public boolean validateToken(String token) {
        return token != null && !token.isBlank();
    }

    private String extractClientIp() {
        return "default-ip";
    }
}
