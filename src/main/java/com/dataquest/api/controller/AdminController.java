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
@RequestMapping("/admin")
@Tag(name = "Administración", description = "Endpoints exclusivos para administradores")
public class AdminController {

    private final SpringDataPuzzleRepository puzzleRepo;
    private final SpringDataRetoSemanalRepository retoRepo;
    private final SpringDataLogSistemaRepository logRepo;
    private final SpringDataUserRepository userRepo;

    public AdminController(SpringDataPuzzleRepository puzzleRepo,
                            SpringDataRetoSemanalRepository retoRepo,
                            SpringDataLogSistemaRepository logRepo,
                            SpringDataUserRepository userRepo) {
        this.puzzleRepo = puzzleRepo;
        this.retoRepo = retoRepo;
        this.logRepo = logRepo;
        this.userRepo = userRepo;
    }

    @GetMapping("/puzzles")
    @Operation(summary = "Listar todos los puzzles")
    public ResponseEntity<List<Map<String, Object>>> getPuzzles() {
        List<Map<String, Object>> result = puzzleRepo.findAll().stream()
            .map(p -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", p.getId());
                m.put("enunciado", p.getEnunciado());
                m.put("tablas_inicial", p.getTablasInicial());
                m.put("df_inicial", p.getDfInicial());
                m.put("solucion_esperada", p.getSolucionEsperada());
                m.put("nivel_dificultad", p.getNivelDificultad());
                return m;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/puzzle/create")
    @Operation(summary = "Crear nuevo puzzle")
    public ResponseEntity<Map<String, Object>> createPuzzle(@RequestBody Map<String, Object> body) {
        PuzzleEntity p = new PuzzleEntity();
        p.setEnunciado((String) body.get("enunciado"));
        p.setTablasInicial(toJsonString(body.get("tablas_inicial")));
        p.setDfInicial(toJsonString(body.get("df_inicial")));
        p.setSolucionEsperada(toJsonString(body.get("solucion_esperada")));
        p.setNivelDificultad(String.valueOf(body.getOrDefault("nivel_dificultad", "1")));
        puzzleRepo.save(p);
        return ResponseEntity.ok(Map.of("success", true, "id", p.getId()));
    }

    @PostMapping("/puzzle/update")
    @Operation(summary = "Actualizar puzzle existente")
    public ResponseEntity<Map<String, Object>> updatePuzzle(@RequestBody Map<String, Object> body) {
        Long id = Long.valueOf(body.get("id").toString());
        var opt = puzzleRepo.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.ok(Map.of("success", false, "error", "Puzzle no encontrado"));
        }
        PuzzleEntity p = opt.get();
        if (body.containsKey("enunciado")) p.setEnunciado((String) body.get("enunciado"));
        if (body.containsKey("tablas_inicial")) p.setTablasInicial(toJsonString(body.get("tablas_inicial")));
        if (body.containsKey("df_inicial")) p.setDfInicial(toJsonString(body.get("df_inicial")));
        if (body.containsKey("solucion_esperada")) p.setSolucionEsperada(toJsonString(body.get("solucion_esperada")));
        if (body.containsKey("nivel_dificultad")) p.setNivelDificultad(String.valueOf(body.get("nivel_dificultad")));
        puzzleRepo.save(p);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/puzzle/delete")
    @Operation(summary = "Eliminar puzzle")
    public ResponseEntity<Map<String, Object>> deletePuzzle(@RequestBody Map<String, Object> body) {
        Long id = Long.valueOf(body.get("id").toString());
        puzzleRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/reto")
    @Operation(summary = "Obtener reto semanal actual")
    public ResponseEntity<Map<String, Object>> getReto() {
        List<RetoSemanalEntity> retos = retoRepo.findAll();
        if (retos.isEmpty()) {
            return ResponseEntity.ok(Map.of());
        }
        RetoSemanalEntity r = retos.get(retos.size() - 1);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", r.getId());
        result.put("descripcion", r.getDescripcion());
        result.put("tablas", r.getTablas());
        result.put("df", r.getDf());
        result.put("fecha_inicio", r.getFechaInicio() != null ? r.getFechaInicio().toString().substring(0, 10) : "");
        result.put("fecha_fin", r.getFechaFin() != null ? r.getFechaFin().toString().substring(0, 10) : "");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reto/save")
    @Operation(summary = "Guardar reto semanal")
    public ResponseEntity<Map<String, Object>> saveReto(@RequestBody Map<String, Object> body) {
        RetoSemanalEntity r;
        if (body.containsKey("id") && body.get("id") != null) {
            r = retoRepo.findById(Long.valueOf(body.get("id").toString())).orElse(new RetoSemanalEntity());
        } else {
            r = new RetoSemanalEntity();
        }
        r.setDescripcion((String) body.get("descripcion"));
        r.setTablas(toJsonString(body.get("tablas")));
        r.setDf(toJsonString(body.get("df")));
        if (body.containsKey("fecha_inicio")) r.setFechaInicio(LocalDateTime.parse(body.get("fecha_inicio") + "T00:00:00"));
        if (body.containsKey("fecha_fin")) r.setFechaFin(LocalDateTime.parse(body.get("fecha_fin") + "T00:00:00"));
        retoRepo.save(r);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/logs")
    @Operation(summary = "Obtener logs del sistema")
    public ResponseEntity<List<Map<String, Object>>> getLogs() {
        List<Map<String, Object>> result = logRepo.findAllByOrderByCreatedAtDesc().stream()
            .map(l -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("fecha", l.getCreatedAt() != null ? l.getCreatedAt().toString() : "");
                m.put("tipo", l.getTipo() != null ? l.getTipo() : "");
                m.put("mensaje", l.getMensaje() != null ? l.getMensaje() : "");
                if (l.getUserId() != null) {
                    userRepo.findById(l.getUserId()).ifPresent(u -> m.put("apodo", u.getApodo()));
                }
                return m;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/logs/clear")
    @Operation(summary = "Limpiar logs del sistema")
    public ResponseEntity<Map<String, Object>> clearLogs() {
        logRepo.deleteAll();
        return ResponseEntity.ok(Map.of("success", true));
    }

    private String toJsonString(Object obj) {
        if (obj == null) return "";
        if (obj instanceof String s) return s;
        return obj.toString();
    }
}
