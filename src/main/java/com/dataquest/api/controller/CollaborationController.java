package com.dataquest.api.controller;

import com.dataquest.infrastructure.persistence.entity.*;
import com.dataquest.infrastructure.persistence.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/collab")
@Tag(name = "Colaboración", description = "Laboratorios colaborativos")
public class CollaborationController {

    private final SpringDataWorkspaceRepository workspaceRepo;
    private final SpringDataWorkspaceMemberRepository memberRepo;
    private final SpringDataUserRepository userRepo;
    private final SpringDataNotificationRepository notifRepo;

    public CollaborationController(SpringDataWorkspaceRepository workspaceRepo,
                                    SpringDataWorkspaceMemberRepository memberRepo,
                                    SpringDataUserRepository userRepo,
                                    SpringDataNotificationRepository notifRepo) {
        this.workspaceRepo = workspaceRepo;
        this.memberRepo = memberRepo;
        this.userRepo = userRepo;
        this.notifRepo = notifRepo;
    }

    @GetMapping("/workspace/{id}")
    @Operation(summary = "Obtener workspace")
    public ResponseEntity<Map<String, Object>> getWorkspace(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        var wsOpt = workspaceRepo.findById(id);
        if (wsOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "error", "Workspace no encontrado"));
        }
        WorkspaceEntity ws = wsOpt.get();

        String hostName = userRepo.findById(ws.getOwnerId()).map(u -> u.getApodo()).orElse("?");
        String typingName = ws.getTypingUserId() != null
            ? userRepo.findById(ws.getTypingUserId()).map(u -> u.getApodo()).orElse(null)
            : null;

        if (ws.getTypingAt() != null && ws.getTypingAt().plusSeconds(5).isBefore(LocalDateTime.now())) {
            typingName = null;
        }

        String lastUserName = ws.getLastActionUserId() != null
            ? userRepo.findById(ws.getLastActionUserId()).map(u -> u.getApodo()).orElse(null)
            : null;

        List<Map<String, Object>> members = memberRepo.findByWorkspaceId(id).stream()
            .map(m -> {
                var user = userRepo.findById(m.getUserId());
                Map<String, Object> mm = new LinkedHashMap<>();
                mm.put("id", m.getUserId());
                mm.put("apodo", user.map(u -> u.getApodo()).orElse("?"));
                return mm;
            })
            .collect(Collectors.toList());

        Map<String, Object> workspace = new LinkedHashMap<>();
        workspace.put("id", ws.getId());
        workspace.put("host_id", ws.getOwnerId());
        workspace.put("host_name", hostName);
        workspace.put("name", ws.getTitle() != null ? ws.getTitle() : "Lab");
        workspace.put("challenge_title", "Reto de Normalización");
        workspace.put("challenge_desc", "Aplica las reglas de normalización para optimizar el esquema relacional.");
        workspace.put("challenge_attrs", ws.getSchemaData() != null ? ws.getSchemaData() : "");
        workspace.put("points_reward", 100);
        workspace.put("attrs_state", ws.getSchemaData() != null ? ws.getSchemaData() : "");
        workspace.put("fds_state", ws.getDependencies() != null ? ws.getDependencies() : "");
        workspace.put("typing_name", typingName);
        workspace.put("last_user_name", lastUserName);
        workspace.put("last_action_text", ws.getLastActionText() != null ? ws.getLastActionText() : "");
        workspace.put("created_at", ws.getCreatedAt() != null ? ws.getCreatedAt().toString() : "");
        workspace.put("members", members);

        return ResponseEntity.ok(Map.of("success", true, "workspace", workspace));
    }

    @PostMapping("/sync/{id}")
    @Operation(summary = "Sincronizar estado del workspace")
    public ResponseEntity<Map<String, Object>> syncState(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, Object> body) {
        var wsOpt = workspaceRepo.findById(id);
        if (wsOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "error", "Workspace no encontrado"));
        }
        WorkspaceEntity ws = wsOpt.get();

        if (body.containsKey("attrs")) ws.setSchemaData((String) body.get("attrs"));
        if (body.containsKey("fds")) ws.setDependencies((String) body.get("fds"));

        ws.setLastActionUserId(userId);
        if (body.containsKey("action")) ws.setLastActionText((String) body.get("action"));
        ws.setUpdatedAt(LocalDateTime.now());
        workspaceRepo.save(ws);

        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/typing/{id}")
    @Operation(summary = "Notificar escritura en workspace")
    public ResponseEntity<Map<String, Object>> updateTyping(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        workspaceRepo.findById(id).ifPresent(ws -> {
            ws.setTypingUserId(userId);
            ws.setTypingAt(LocalDateTime.now());
            workspaceRepo.save(ws);
        });
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/submit/{id}")
    @Operation(summary = "Enviar solución colaborativa")
    public ResponseEntity<Map<String, Object>> submitSolution(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, Object> body) {
        var wsOpt = workspaceRepo.findById(id);
        if (wsOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "error", "Workspace no encontrado"));
        }
        WorkspaceEntity ws = wsOpt.get();

        String userFds = (String) body.getOrDefault("fds", "");

        boolean correct = userFds != null && !userFds.trim().isEmpty();

        if (correct) {
            List<WorkspaceMemberEntity> members = memberRepo.findByWorkspaceId(id);
            int points = 100;
            for (var m : members) {
                userRepo.findById(m.getUserId()).ifPresent(u -> {
                    u.setTotalXp((u.getTotalXp() != null ? u.getTotalXp() : 0) + points);
                    userRepo.save(u);
                });
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "¡Reto Superado!", "points", points));
        } else {
            return ResponseEntity.ok(Map.of("success", false, "error", "El diseño relacional aún no es óptimo."));
        }
    }

    @PostMapping("/invite")
    @Operation(summary = "Invitar usuario a workspace")
    public ResponseEntity<Map<String, Object>> sendInvitation(
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, Object> body) {
        Long targetUserId = body.containsKey("user_id")
            ? Long.valueOf(body.get("user_id").toString())
            : Long.valueOf(body.get("receiver_id").toString());

        var existing = memberRepo.findByUserId(userId);
        Long workspaceId;
        if (existing.isEmpty()) {
            WorkspaceEntity ws = new WorkspaceEntity();
            ws.setOwnerId(userId);
            ws.setTitle("Lab colaborativo");
            ws = workspaceRepo.save(ws);
            workspaceId = ws.getId();
            WorkspaceMemberEntity member = new WorkspaceMemberEntity();
            member.setWorkspaceId(workspaceId);
            member.setUserId(userId);
            member.setRole("owner");
            memberRepo.save(member);
        } else {
            workspaceId = existing.get(0).getWorkspaceId();
        }

        NotificationEntity notif = new NotificationEntity();
        notif.setUserId(targetUserId);
        notif.setSenderId(userId);
        notif.setTipo("lab_invite");
        notif.setMensaje("te ha invitado a un laboratorio");
        notif.setLeida(false);
        notif.setCreatedAt(LocalDateTime.now());
        notifRepo.save(notif);

        return ResponseEntity.ok(Map.of("success", true, "workspace_id", workspaceId));
    }

    @PostMapping("/accept")
    @Operation(summary = "Aceptar invitación")
    public ResponseEntity<Map<String, Object>> acceptInvitation(
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, Object> body) {
        Long notifId = Long.valueOf(body.get("notification_id").toString());
        var notifOpt = notifRepo.findById(notifId);
        if (notifOpt.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "error", "Invitación no encontrada"));
        }
        NotificationEntity notif = notifOpt.get();
        notif.setLeida(true);
        notifRepo.save(notif);

        Long senderId = notif.getSenderId() != null ? notif.getSenderId() : userId;

        WorkspaceEntity ws = new WorkspaceEntity();
        ws.setOwnerId(senderId);
        ws.setTitle("Lab colaborativo");
        ws = workspaceRepo.save(ws);

        WorkspaceMemberEntity member1 = new WorkspaceMemberEntity();
        member1.setWorkspaceId(ws.getId());
        member1.setUserId(senderId);
        member1.setRole("owner");
        memberRepo.save(member1);

        WorkspaceMemberEntity member2 = new WorkspaceMemberEntity();
        member2.setWorkspaceId(ws.getId());
        member2.setUserId(userId);
        member2.setRole("member");
        memberRepo.save(member2);

        NotificationEntity ack = new NotificationEntity();
        ack.setUserId(senderId);
        ack.setSenderId(userId);
        ack.setTipo("lab_accepted");
        ack.setMensaje("ha aceptado tu invitación al laboratorio");
        ack.setLeida(false);
        ack.setReferenceId(ws.getId());
        ack.setCreatedAt(LocalDateTime.now());
        notifRepo.save(ack);

        return ResponseEntity.ok(Map.of("success", true, "workspace_id", ws.getId()));
    }

    @PostMapping("/create")
    @Operation(summary = "Crear workspace colaborativo")
    public ResponseEntity<Map<String, Object>> createWorkspace(
            @RequestAttribute("userId") Long userId,
            @RequestBody Map<String, Object> body) {
        WorkspaceEntity ws = new WorkspaceEntity();
        ws.setOwnerId(userId);
        ws.setTitle((String) body.getOrDefault("title", "Lab sin título"));
        ws.setSchemaData((String) body.getOrDefault("schema", ""));
        ws.setDependencies((String) body.getOrDefault("dependencies", "{}"));
        ws = workspaceRepo.save(ws);

        WorkspaceMemberEntity member = new WorkspaceMemberEntity();
        member.setWorkspaceId(ws.getId());
        member.setUserId(userId);
        member.setRole("owner");
        memberRepo.save(member);

        return ResponseEntity.ok(Map.of("success", true, "workspace_id", ws.getId()));
    }

    @PostMapping("/join/{id}")
    @Operation(summary = "Unirse a workspace")
    public ResponseEntity<Map<String, Object>> joinWorkspace(
            @PathVariable Long id,
            @RequestAttribute("userId") Long userId) {
        if (memberRepo.findByWorkspaceIdAndUserId(id, userId).isPresent()) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Ya eres miembro"));
        }
        WorkspaceMemberEntity member = new WorkspaceMemberEntity();
        member.setWorkspaceId(id);
        member.setUserId(userId);
        memberRepo.save(member);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
