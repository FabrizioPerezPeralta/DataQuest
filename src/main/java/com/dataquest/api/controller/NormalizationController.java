package com.dataquest.api.controller;

import com.dataquest.application.dto.NormalizationRequest;
import com.dataquest.application.dto.NormalizationResponse;
import com.dataquest.application.port.inbound.NormalizationUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/normalize")
@Tag(name = "Normalización", description = "Endpoints del motor de normalización")
public class NormalizationController {

    private final NormalizationUseCase normalizationUseCase;

    public NormalizationController(NormalizationUseCase normalizationUseCase) {
        this.normalizationUseCase = normalizationUseCase;
    }

    @PostMapping("/ai")
    @Operation(summary = "Analizar esquema (compatible con frontend)")
    public ResponseEntity<Map<String, Object>> aiAnalyze(@RequestBody Map<String, Object> body) {
        String attrsStr = (String) body.getOrDefault("attrs", "");
        String fdsStr = (String) body.getOrDefault("fds", "");

        Set<String> attributes = attrsStr.isEmpty() ? Set.of()
            : Arrays.stream(attrsStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        List<String> functionalDependencies = fdsStr.isEmpty() ? List.of()
            : Arrays.stream(fdsStr.split(";"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        if (functionalDependencies.isEmpty() && !fdsStr.isEmpty()) {
            functionalDependencies = List.of(fdsStr);
        }

        NormalizationRequest request = new NormalizationRequest(
            attributes, functionalDependencies,
            (String) body.getOrDefault("sourceSql", ""),
            (String) body.getOrDefault("sourceCsv", "")
        );

        NormalizationResponse response = normalizationUseCase.analyze(request);
        return buildResponse(response);
    }

    @PostMapping("/analyze")
    @Operation(summary = "Analizar esquema relacional (formato estructurado)")
    public ResponseEntity<?> analyze(@RequestBody NormalizationRequest request) {
        NormalizationResponse response = normalizationUseCase.analyze(request);
        if (!response.success()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> buildResponse(NormalizationResponse r) {
        if (!r.success()) {
            return ResponseEntity.ok(Map.of("success", false, "error", r.error()));
        }

        List<Map<String, Object>> reportSteps = new ArrayList<>();

        Map<String, Object> step1 = new LinkedHashMap<>();
        step1.put("title", "1FN - Atributos Atómicos");
        step1.put("step", "1");
        step1.put("explanation", "Cada atributo debe contener valores atómicos. No hay grupos repetitivos.");
        List<Map<String, Object>> tables1 = new ArrayList<>();
        for (var rel : r.bcnfDecomposition()) {
            Map<String, Object> t = new LinkedHashMap<>();
            t.put("name", rel.name());
            t.put("attrs", rel.attributes() != null ? new ArrayList<>(rel.attributes()) : List.of());
            t.put("pk", rel.primaryKey() != null ? new ArrayList<>(rel.primaryKey()) : List.of());
            tables1.add(t);
        }
        if (tables1.isEmpty()) {
            Map<String, Object> t = new LinkedHashMap<>();
            t.put("name", "Relación");
            t.put("attrs", r.candidateKeys() != null && !r.candidateKeys().isEmpty()
                ? new ArrayList<>(r.candidateKeys().iterator().next()) : List.of());
            t.put("pk", List.of());
            tables1.add(t);
        }
        step1.put("tables", tables1);
        reportSteps.add(step1);

        Map<String, Object> step2 = new LinkedHashMap<>();
        step2.put("title", "2FN - Dependencias Parciales");
        step2.put("step", "2");
        step2.put("explanation", "No debe haber dependencias parciales de la clave primaria.");
        step2.put("tables", tables1);
        reportSteps.add(step2);

        Map<String, Object> step3 = new LinkedHashMap<>();
        step3.put("title", "3FN - Dependencias Transitivas");
        step3.put("step", "3");
        step3.put("explanation", "No debe haber dependencias transitivas de atributos no clave.");
        step3.put("tables", tables1);
        reportSteps.add(step3);

        Map<String, Object> step4 = new LinkedHashMap<>();
        step4.put("title", "BCNF - Forma Normal de Boyce-Codd");
        step4.put("step", "4");
        step4.put("explanation", "Cada determinante debe ser una clave candidata.");
        step4.put("tables", tables1);
        reportSteps.add(step4);

        String mermaid = erdToMermaid(tables1);
        String sql = r.sqlStatements() != null && !r.sqlStatements().isEmpty()
            ? String.join("\n", r.sqlStatements()) : generateCreateTableSql(tables1);

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("mermaid", mermaid);
        metrics.put("quality", r.violations() != null && r.violations().isEmpty() ? 100 : 60);
        metrics.put("preservation", r.canonicalCover() != null && !r.canonicalCover().isEmpty());
        metrics.put("sql", sql);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("currentNormalForm", r.currentNormalForm());
        response.put("candidateKeys", r.candidateKeys() != null
            ? r.candidateKeys().stream().map(ArrayList::new).collect(Collectors.toList()) : List.of());
        response.put("canonicalCover", r.canonicalCover());
        response.put("violations", r.violations());
        response.put("recommendations", r.recommendations());
        response.put("metrics", metrics);
        response.put("report", reportSteps);

        return ResponseEntity.ok(response);
    }

    private String erdToMermaid(List<Map<String, Object>> tables) {
        StringBuilder sb = new StringBuilder("erDiagram\n");
        for (var t : tables) {
            String name = (String) t.get("name");
            sb.append("  ").append(name).append(" {\n");
            @SuppressWarnings("unchecked")
            List<String> attrs = (List<String>) t.get("attrs");
            @SuppressWarnings("unchecked")
            List<String> pks = (List<String>) t.get("pk");
            if (attrs != null) {
                for (String a : attrs) {
                    boolean isPk = pks != null && pks.contains(a);
                    sb.append("    ").append(isPk ? "PK " : "    ").append(a).append(" string\n");
                }
            }
            sb.append("  }\n");
        }
        return sb.toString();
    }

    private String generateCreateTableSql(List<Map<String, Object>> tables) {
        StringBuilder sb = new StringBuilder();
        for (var t : tables) {
            String name = (String) t.get("name");
            sb.append("CREATE TABLE ").append(name).append(" (\n");
            @SuppressWarnings("unchecked")
            List<String> attrs = (List<String>) t.get("attrs");
            @SuppressWarnings("unchecked")
            List<String> pks = (List<String>) t.get("pk");
            if (attrs != null) {
                for (int i = 0; i < attrs.size(); i++) {
                    sb.append("  ").append(attrs.get(i)).append(" VARCHAR(255)");
                    if (pks != null && pks.contains(attrs.get(i))) {
                        sb.append(" PRIMARY KEY");
                    }
                    if (i < attrs.size() - 1) sb.append(",");
                    sb.append("\n");
                }
            }
            sb.append(");\n\n");
        }
        return sb.toString();
    }
}
