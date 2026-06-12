package com.dataquest.api.controller;

import com.dataquest.application.port.outbound.UserProgressRepository;
import com.dataquest.application.port.outbound.UserRepository;
import com.dataquest.domain.entity.User;
import com.dataquest.domain.entity.UserProgress;
import com.dataquest.infrastructure.persistence.entity.UserProgressEntity;
import com.dataquest.infrastructure.persistence.repository.SpringDataLogSistemaRepository;
import com.dataquest.infrastructure.persistence.repository.SpringDataUserProgressRepository;
import com.dataquest.infrastructure.persistence.repository.SpringDataUserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard", description = "Estadísticas y resumen del usuario")
public class DashboardController {

    private final SpringDataUserRepository userRepo;
    private final SpringDataUserProgressRepository progressRepo;
    private final SpringDataLogSistemaRepository logRepo;

    public DashboardController(SpringDataUserRepository userRepo,
                                SpringDataUserProgressRepository progressRepo,
                                SpringDataLogSistemaRepository logRepo) {
        this.userRepo = userRepo;
        this.progressRepo = progressRepo;
        this.logRepo = logRepo;
    }

    @GetMapping("/stats")
    @Operation(summary = "Obtener estadísticas del dashboard")
    public ResponseEntity<Map<String, Object>> getStats(
            @RequestAttribute("userId") Long userId) {
        var userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "error", "Usuario no encontrado"));
        }
        var user = userOpt.get();
        List<UserProgressEntity> allProgress = progressRepo.findByUserId(userId);

        int totalXP = allProgress.stream().mapToInt(p -> p.getScore() != null ? p.getScore() : 0).sum();
        int puzzlesSolved = allProgress.size();
        int levelsCompleted = (int) allProgress.stream().filter(p -> p.getCompletedAt() != null).count();
        int totalLevels = (int) progressRepo.count();
        int percentage = totalLevels > 0 ? (levelsCompleted * 100 / totalLevels) : 0;
        long medalCount = user.getTotalXp() != null ? user.getTotalXp() / 500 : 0;

        List<Map<String, String>> recentActivity = allProgress.stream()
            .sorted((a, b) -> b.getCompletedAt() != null && a.getCompletedAt() != null
                ? b.getCompletedAt().compareTo(a.getCompletedAt()) : 0)
            .limit(5)
            .map(p -> {
                String msg = p.getCompletedAt() != null
                    ? "Completaste un nivel +" + p.getScore() + " XP"
                    : "Intentaste un nivel";
                return Map.of("mensaje", msg);
            })
            .collect(Collectors.toList());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("apodo", user.getApodo());
        response.put("email", user.getCorreo());
        response.put("xp", totalXP);
        response.put("percentage", percentage);
        response.put("medallas", medalCount);
        response.put("puzzles_solved", puzzlesSolved);
        response.put("levels_completed", levelsCompleted);
        response.put("recent_activity", recentActivity);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/global-activity")
    @Operation(summary = "Actividad global de la comunidad")
    public ResponseEntity<Map<String, Object>> getGlobalActivity() {
        List<Map<String, Object>> feed = logRepo.findAllByOrderByCreatedAtDesc().stream()
            .limit(8)
            .map(l -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("mensaje", l.getMensaje() != null ? l.getMensaje() : "");
                item.put("fecha", l.getCreatedAt() != null ? l.getCreatedAt().toString() : "");
                if (l.getUserId() != null) {
                    userRepo.findById(l.getUserId()).ifPresent(u -> item.put("apodo", u.getApodo()));
                }
                return item;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("success", true, "feed", feed));
    }
}
