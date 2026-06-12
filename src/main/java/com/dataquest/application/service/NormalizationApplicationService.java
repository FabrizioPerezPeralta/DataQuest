package com.dataquest.application.service;

import com.dataquest.application.dto.NormalizationRequest;
import com.dataquest.application.dto.NormalizationResponse;
import com.dataquest.application.port.inbound.NormalizationUseCase;
import com.dataquest.domain.NormalizationLevel;
import com.dataquest.domain.service.NormalizationService;
import com.dataquest.domain.valueobject.CanonicalCover;
import com.dataquest.domain.valueobject.FunctionalDependency;
import com.dataquest.domain.valueobject.RelationSchema;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class NormalizationApplicationService implements NormalizationUseCase {

    private final NormalizationService normalizationService;

    public NormalizationApplicationService(NormalizationService normalizationService) {
        this.normalizationService = normalizationService;
    }

    @Override
    public NormalizationResponse analyze(NormalizationRequest request) {
        try {
            Set<String> attributes = request.attributes();
            List<FunctionalDependency> fds = parseFunctionalDependencies(request.functionalDependencies());

            if (attributes == null || attributes.isEmpty()) {
                return NormalizationResponse.error("Se requieren atributos para el análisis.");
            }

            List<Set<String>> candidateKeys = normalizationService.findCandidateKeys(attributes, fds);
            CanonicalCover canonicalCover = normalizationService.computeCanonicalCover(fds);
            NormalizationLevel currentLevel = normalizationService.determineNormalForm(attributes, fds);

            List<String> violations = new ArrayList<>();
            List<String> recommendations = new ArrayList<>();

            switch (currentLevel) {
                case ONE_NF -> {
                    violations.add("Existen dependencias parciales (violación de 2FN).");
                    recommendations.add("Eliminar dependencias parciales separando atributos que dependen de parte de la clave.");
                }
                case TWO_NF -> {
                    violations.add("Existen dependencias transitivas (violación de 3FN).");
                    recommendations.add("Eliminar dependencias transitivas creando tablas separadas para atributos no clave.");
                }
                case THREE_NF -> {
                    violations.add("Existen dependencias donde el determinante no es clave candidata (violación de FNBC).");
                    recommendations.add("Descomponer en FNBC para eliminar todas las anomalías.");
                }
                case BCNF -> recommendations.add("El esquema está en FNBC. No se requieren más descomposiciones.");
            }

            List<RelationSchema> bcnfDecomposition = normalizationService.decomposeBCNF(attributes, fds);

            List<String> sqlStatements = new ArrayList<>();
            List<NormalizationResponse.DecomposedRelation> decomposed = new ArrayList<>();

            for (RelationSchema rs : bcnfDecomposition) {
                String sql = normalizationService.generateCreateTableSQL(
                    rs.getName(), rs.getAttributes(), rs.getPrimaryKey());
                sqlStatements.add(sql);
                decomposed.add(new NormalizationResponse.DecomposedRelation(
                    rs.getName(), rs.getAttributes(), rs.getPrimaryKey()));
            }

            return NormalizationResponse.ok(
                currentLevel.name(),
                candidateKeys,
                canonicalCover.toString(),
                violations,
                recommendations,
                decomposed,
                sqlStatements
            );

        } catch (Exception e) {
            return NormalizationResponse.error("Error en el análisis: " + e.getMessage());
        }
    }

    private List<FunctionalDependency> parseFunctionalDependencies(List<String> fdStrings) {
        if (fdStrings == null) return List.of();
        return fdStrings.stream()
            .map(this::parseSingleFD)
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    private FunctionalDependency parseSingleFD(String fd) {
        try {
            String[] parts = fd.split("->");
            if (parts.length != 2) return null;
            Set<String> lhs = parseAttributeList(parts[0].trim());
            Set<String> rhs = parseAttributeList(parts[1].trim());
            if (lhs.isEmpty() || rhs.isEmpty()) return null;
            return new FunctionalDependency(lhs, rhs);
        } catch (Exception e) {
            return null;
        }
    }

    private Set<String> parseAttributeList(String input) {
        return Arrays.stream(input.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
