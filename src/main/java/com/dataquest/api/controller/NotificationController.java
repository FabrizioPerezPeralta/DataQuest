package com.dataquest.api.controller;

import com.dataquest.infrastructure.persistence.entity.NotificationEntity;
import com.dataquest.infrastructure.persistence.repository.SpringDataNotificationRepository;
import com.dataquest.infrastructure.persistence.repository.SpringDataUserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notificaciones", description = "Notificaciones del usuario")
public class NotificationController {

    private final SpringDataNotificationRepository repo;
    private final SpringDataUserRepository userRepo;

    public NotificationController(SpringDataNotificationRepository repo,
                                   SpringDataUserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    @GetMapping
    @Operation(summary = "Obtener notificaciones del usuario")
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.ok(Map.of("success", true, "notifications", List.of()));
        }
        List<Map<String, Object>> notifications = repo.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(this::toMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("success", true, "notifications", notifications));
    }

    @PostMapping("/read/{id}")
    @Operation(summary = "Marcar notificación como leída")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long id,
            @RequestAttribute(value = "userId", required = false) Long userId) {
        repo.findById(id).ifPresent(n -> {
            if (n.getUserId().equals(userId)) {
                n.setLeida(true);
                repo.save(n);
            }
        });
        return ResponseEntity.ok(Map.of("success", true));
    }

    private Map<String, Object> toMap(NotificationEntity n) {
        String senderName = "Sistema";
        if (n.getSenderId() != null) {
            senderName = userRepo.findById(n.getSenderId())
                .map(u -> u.getApodo())
                .orElse("Sistema");
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", n.getId());
        m.put("type", n.getTipo() != null ? n.getTipo() : "info");
        m.put("sender_id", n.getSenderId());
        m.put("sender_name", senderName);
        m.put("content", n.getMensaje() != null ? n.getMensaje() : "");
        m.put("created_at", n.getCreatedAt() != null ? n.getCreatedAt().toString() : LocalDateTime.now().toString());
        m.put("is_read", n.getLeida() != null ? n.getLeida() : false);
        m.put("reference_id", n.getReferenceId());
        return m;
    }
}
