package com.dataquest.api.controller;

import com.dataquest.api.security.JwtTokenProvider;
import com.dataquest.application.dto.AuthRequest;
import com.dataquest.application.dto.AuthResponse;
import com.dataquest.application.dto.UserRegistrationRequest;
import com.dataquest.application.port.inbound.AuthUseCase;
import com.dataquest.infrastructure.persistence.entity.UserEntity;
import com.dataquest.infrastructure.persistence.repository.SpringDataUserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticación", description = "Endpoints de autenticación y registro")
public class AuthController {

    private final AuthUseCase authUseCase;
    private final JwtTokenProvider tokenProvider;
    private final SpringDataUserRepository userRepo;

    public AuthController(AuthUseCase authUseCase, JwtTokenProvider tokenProvider,
                          SpringDataUserRepository userRepo) {
        this.authUseCase = authUseCase;
        this.tokenProvider = tokenProvider;
        this.userRepo = userRepo;
    }

    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody UserRegistrationRequest request) {
        AuthResponse response = authUseCase.register(request);
        if (!response.success()) {
            return ResponseEntity.badRequest().body(response);
        }
        String token = tokenProvider.generateToken(response.userId(), response.role());
        return ResponseEntity.ok(AuthResponse.ok(token, response.userId(), response.nickname(), response.role()));
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authUseCase.login(request);
        if (!response.success()) {
            return ResponseEntity.badRequest().body(response);
        }
        String token = tokenProvider.generateToken(response.userId(), response.role());
        return ResponseEntity.ok(AuthResponse.ok(token, response.userId(), response.nickname(), response.role()));
    }

    @PostMapping("/guest")
    @Operation(summary = "Crear sesión de invitado")
    public ResponseEntity<AuthResponse> createGuest() {
        AuthResponse response = authUseCase.createGuestSession();
        String token = tokenProvider.generateToken(response.userId(), response.role());
        return ResponseEntity.ok(AuthResponse.ok(token, response.userId(), response.nickname(), response.role()));
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener datos del usuario autenticado")
    public ResponseEntity<?> me(@RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.ok(new MeResponse(false, null));
        }
        var userOpt = getCurrentUserEntity(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(new MeResponse(false, null));
        }
        var user = userOpt.get();
        boolean isGuest = user.getRole() == com.dataquest.domain.UserRole.GUEST;
        return ResponseEntity.ok(new MeResponse(true, new MeUser(
            user.getId(), user.getApodo(), user.getRole().name().toLowerCase(),
            user.getRachaDias(), isGuest
        )));
    }

    private java.util.Optional<UserEntity> getCurrentUserEntity(Long userId) {
        return userRepo.findById(userId);
    }

    public record MeResponse(boolean authenticated, MeUser user) {}
    public record MeUser(Long id, String apodo, String role, int racha_dias, boolean isGuest) {}

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión")
    public ResponseEntity<Void> logout(@RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId != null) {
            authUseCase.logout(userId);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-password")
    @Operation(summary = "Cambiar contraseña")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestAttribute("userId") Long userId,
            @RequestBody ChangePasswordRequest request) {
        try {
            authUseCase.changePassword(userId, request.currentPassword(), request.newPassword());
            return ResponseEntity.ok(Map.of("success", true, "message", "Contraseña actualizada correctamente"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    public record ChangePasswordRequest(
        @com.fasterxml.jackson.annotation.JsonProperty("current_password") String currentPassword,
        @com.fasterxml.jackson.annotation.JsonProperty("new_password") String newPassword
    ) {}
}
