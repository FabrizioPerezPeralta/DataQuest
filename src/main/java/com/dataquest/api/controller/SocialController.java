package com.dataquest.api.controller;

import com.dataquest.infrastructure.persistence.entity.MessageEntity;
import com.dataquest.infrastructure.persistence.entity.UserEntity;
import com.dataquest.infrastructure.persistence.repository.SpringDataMessageRepository;
import com.dataquest.infrastructure.persistence.repository.SpringDataUserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/social")
@Tag(name = "Social", description = "Social y comunidad")
public class SocialController {

    private final SpringDataUserRepository userRepo;
    private final SpringDataMessageRepository messageRepo;
    private static final Map<Long, LocalDateTime> onlineUsers = new ConcurrentHashMap<>();

    public SocialController(SpringDataUserRepository userRepo,
                            SpringDataMessageRepository messageRepo) {
        this.userRepo = userRepo;
        this.messageRepo = messageRepo;
    }

    @GetMapping("/online")
    @Operation(summary = "Usuarios conectados")
    public ResponseEntity<Map<String, Object>> getOnlineUsers(
            @RequestAttribute(value = "userId", required = false) Long currentUserId) {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(5);
        onlineUsers.entrySet().removeIf(e -> e.getValue().isBefore(threshold));

        List<Map<String, Object>> users = onlineUsers.keySet().stream()
            .map(id -> userRepo.findById(id))
            .filter(Optional::isPresent)
            .map(u -> {
                long unread = currentUserId != null
                    ? messageRepo.countBySenderIdAndReceiverIdAndIsRead(u.get().getId(), currentUserId, false)
                    : 0;
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", u.get().getId());
                m.put("apodo", u.get().getApodo());
                m.put("role", u.get().getRole().name().toLowerCase());
                m.put("last_seen", u.get().getUltimaConexion() != null ? u.get().getUltimaConexion().toString() : "");
                m.put("unread_count", unread);
                return m;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "users", users, "total", users.size()));
    }

    @PostMapping("/presence")
    @Operation(summary = "Actualizar presencia")
    public ResponseEntity<Map<String, Object>> updatePresence(
            @RequestAttribute(value = "userId", required = false) Long userId) {
        if (userId != null) {
            onlineUsers.put(userId, LocalDateTime.now());
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/leaderboard")
    @Operation(summary = "Ranking global")
    public ResponseEntity<Map<String, Object>> getLeaderboard() {
        List<UserEntity> users = userRepo.findAll();
        List<Map<String, Object>> sorted = users.stream()
            .filter(u -> u.getRole() != com.dataquest.domain.UserRole.GUEST)
            .map(u -> {
                long totalXp = u.getTotalXp() != null ? u.getTotalXp() : 0;
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", u.getId());
                m.put("apodo", u.getApodo());
                m.put("role", u.getRole().name().toLowerCase());
                m.put("xp", totalXp);
                m.put("medallas", u.getMedalCount());
                return m;
            })
            .sorted((a, b) -> Long.compare((Long)b.get("xp"), (Long)a.get("xp")))
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "leaderboard", sorted, "page", 1));
    }

    @GetMapping("/messages/{userId}")
    @Operation(summary = "Obtener mensajes con un usuario")
    public ResponseEntity<Map<String, Object>> getMessages(
            @RequestAttribute("userId") Long currentUserId,
            @PathVariable Long userId) {
        messageRepo.markAsReadBySenderAndReceiver(userId, currentUserId);

        List<MessageEntity> messages = messageRepo
            .findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByCreatedAtAsc(
                currentUserId, userId, userId, currentUserId);

        List<Map<String, Object>> result = messages.stream()
            .map(m -> {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", m.getId());
                item.put("sender_id", m.getSenderId());
                item.put("receiver_id", m.getReceiverId());
                item.put("content", m.getContent());
                item.put("is_read", m.getIsRead());
                item.put("sender_name", m.getSenderName() != null ? m.getSenderName() : "");
                item.put("created_at", m.getCreatedAt() != null ? m.getCreatedAt().toString() : "");
                return item;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "messages", result));
    }

    @PostMapping("/messages")
    @Operation(summary = "Enviar mensaje")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @RequestAttribute("userId") Long senderId,
            @RequestBody Map<String, Object> body) {
        Long receiverId = Long.valueOf(body.get("receiver_id").toString());
        String content = (String) body.get("content");

        MessageEntity msg = new MessageEntity();
        msg.setSenderId(senderId);
        msg.setReceiverId(receiverId);
        msg.setContent(content);
        msg.setCreatedAt(LocalDateTime.now());
        msg.setIsRead(false);

        userRepo.findById(senderId).ifPresent(u -> msg.setSenderName(u.getApodo()));

        messageRepo.save(msg);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
