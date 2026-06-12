package com.dataquest.application.dto;

import java.util.List;
import java.util.Set;

public record NormalizationResponse(
    boolean success,
    String currentNormalForm,
    List<Set<String>> candidateKeys,
    String canonicalCover,
    List<String> violations,
    List<String> recommendations,
    List<DecomposedRelation> bcnfDecomposition,
    List<String> sqlStatements,
    String error
) {
    public static NormalizationResponse ok(String currentNormalForm, List<Set<String>> candidateKeys,
                                           String canonicalCover, List<String> violations,
                                           List<String> recommendations,
                                           List<DecomposedRelation> bcnfDecomposition,
                                           List<String> sqlStatements) {
        return new NormalizationResponse(true, currentNormalForm, candidateKeys, canonicalCover,
            violations, recommendations, bcnfDecomposition, sqlStatements, null);
    }

    public static NormalizationResponse error(String message) {
        return new NormalizationResponse(false, null, null, null, null, null, null, null, message);
    }

    public record DecomposedRelation(
        String name,
        Set<String> attributes,
        Set<String> primaryKey
    ) {}
}
