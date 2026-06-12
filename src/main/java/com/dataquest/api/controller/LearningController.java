package com.dataquest.api.controller;

import com.dataquest.infrastructure.persistence.entity.LearningLevelEntity;
import com.dataquest.infrastructure.persistence.entity.UserProgressEntity;
import com.dataquest.infrastructure.persistence.repository.SpringDataLearningLevelRepository;
import com.dataquest.infrastructure.persistence.repository.SpringDataUserProgressRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/learning-path")
@Tag(name = "Aprendizaje", description = "Endpoints del sistema de aprendizaje gamificado")
public class LearningController {

    private final SpringDataLearningLevelRepository levelRepo;
    private final SpringDataUserProgressRepository progressRepo;

    public LearningController(SpringDataLearningLevelRepository levelRepo,
                               SpringDataUserProgressRepository progressRepo) {
        this.levelRepo = levelRepo;
        this.progressRepo = progressRepo;
    }

    @GetMapping("/progress")
    @Operation(summary = "Obtener progreso del usuario")
    public ResponseEntity<Map<String, Object>> getProgress(
            @RequestAttribute(value = "userId", required = false) Long userId) {
        List<LearningLevelEntity> levels = levelRepo.findAllByOrderByWorldAscLevelNumberAsc();
        List<UserProgressEntity> progress = userId != null
            ? progressRepo.findByUserId(userId)
            : List.of();

        Set<Long> completedIds = progress.stream()
            .filter(p -> p.getCompletedAt() != null)
            .map(UserProgressEntity::getLevelId)
            .collect(Collectors.toSet());

        Optional<Long> maxCompleted = completedIds.stream().max(Long::compare);
        long currentLevelId = maxCompleted.orElse(0L) + 1;

        List<Map<String, Object>> missions = levels.stream()
            .map(l -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", l.getId());
                m.put("world", l.getWorld());
                m.put("level_number", l.getLevelNumber());
                m.put("title", l.getTitle());
                m.put("desc", l.getDescription());
                m.put("xp", l.getXp());

                if (l.getInitialSchema() != null) {
                    try {
                        m.put("initial_schema", parseJsonArray(l.getInitialSchema()));
                    } catch (Exception e) {
                        m.put("initial_schema", l.getInitialSchema());
                    }
                } else {
                    m.put("initial_schema", List.of());
                }

                if (l.getHints() != null) {
                    try {
                        m.put("hints", parseJsonArray(l.getHints()));
                    } catch (Exception e) {
                        m.put("hints", List.of(l.getHints()));
                    }
                } else {
                    m.put("hints", List.of());
                }

                m.put("theory", l.getTheory());
                m.put("difficulty", l.getDifficulty() != null ? l.getDifficulty().name() : "EASY");

                var prog = progress.stream()
                    .filter(p -> p.getLevelId().equals(l.getId()))
                    .findFirst();

                if (prog.isPresent() && prog.get().getCompletedAt() != null) {
                    m.put("status", "completed");
                    m.put("stars", prog.get().getStarsEarned() != null ? prog.get().getStarsEarned() : 0);
                } else if (l.getId().equals(currentLevelId) || currentLevelId == 0) {
                    m.put("status", "current");
                    m.put("stars", 0);
                } else {
                    m.put("status", "locked");
                    m.put("stars", 0);
                }

                return m;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "missions", missions));
    }

    @PostMapping("/submit")
    @Operation(summary = "Enviar solución de un nivel")
    public ResponseEntity<Map<String, Object>> submitSolution(
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, Object> body) {
        Long levelId = Long.valueOf(body.get("level_id").toString());
        Object respuesta = body.get("respuesta");

        var levelOpt = levelRepo.findById(levelId);
        if (levelOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "error", "Nivel no encontrado"));
        }
        var level = levelOpt.get();

        String userSolution = respuesta != null ? respuesta.toString().trim().toLowerCase() : "";
        String expected = level.getExpectedSolution() != null ? level.getExpectedSolution().trim().toLowerCase() : "";

        boolean correct = userSolution.equals(expected);

        var existingProgress = progressRepo.findByUserIdAndLevelId(userId, levelId);
        UserProgressEntity prog = existingProgress.orElseGet(() -> {
            UserProgressEntity p = new UserProgressEntity();
            p.setUserId(userId);
            p.setLevelId(levelId);
            p.setAttempts(0);
            p.setScore(0);
            p.setStarsEarned(0);
            return p;
        });

        if (correct) {
            int hintsUsed = body.containsKey("hints_used") ? Integer.parseInt(body.get("hints_used").toString()) : 0;
            int attempts = (prog.getAttempts() != null ? prog.getAttempts() : 0) + 1;

            int stars;
            if (hintsUsed == 0 && attempts <= 2) stars = 3;
            else if (hintsUsed <= 1 && attempts <= 5) stars = 2;
            else stars = 1;

            int xp = level.getXp() != null ? level.getXp() : 100;
            int scoreEarned = xp * stars / 3;
            int totalStars = stars;

            if (prog.getCompletedAt() == null) {
                if (prog.getStarsEarned() == null || stars > prog.getStarsEarned()) {
                    prog.setStarsEarned(stars);
                }
                prog.setScore((prog.getScore() != null ? prog.getScore() : 0) + scoreEarned);
                prog.setAttempts(attempts);
                prog.setCompletedAt(java.time.LocalDateTime.now());
                progressRepo.save(prog);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "stars", totalStars,
                "score_earned", scoreEarned,
                "message", "¡Felicidades! Has ganado " + totalStars + " estrellas."
            ));
        } else {
            prog.setAttempts((prog.getAttempts() != null ? prog.getAttempts() : 0) + 1);
            progressRepo.save(prog);
            return ResponseEntity.ok(Map.of(
                "success", false,
                "error", "Respuesta incorrecta. ¡Inténtalo de nuevo!"
            ));
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> parseJsonArray(String json) {
        try {
            Object parsed = new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, Object.class);
            if (parsed instanceof List) {
                return (List<String>) parsed;
            }
            return List.of(json);
        } catch (Exception e) {
            return List.of(json);
        }
    }
}
