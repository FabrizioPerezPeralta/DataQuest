package com.dataquest.domain.service;

import com.dataquest.domain.NormalizationLevel;
import com.dataquest.domain.valueobject.CanonicalCover;
import com.dataquest.domain.valueobject.FunctionalDependency;
import com.dataquest.domain.valueobject.RelationSchema;
import java.util.*;
import java.util.stream.Collectors;

public class NormalizationService {

    public Set<String> computeClosure(Set<String> attributes, List<FunctionalDependency> fds) {
        return new RelationSchema("TEMP", attributes, fds).computeClosure(attributes);
    }

    public List<Set<String>> findCandidateKeys(Set<String> attributes, List<FunctionalDependency> fds) {
        return new RelationSchema("TEMP", attributes, fds).findCandidateKeys();
    }

    public CanonicalCover computeCanonicalCover(List<FunctionalDependency> fds) {
        return new CanonicalCover(fds);
    }

    public NormalizationLevel determineNormalForm(Set<String> attributes, List<FunctionalDependency> fds) {
        if (attributes == null || attributes.isEmpty()) return NormalizationLevel.ONE_NF;

        boolean hasPartialDeps = false;
        boolean hasTransitiveDeps = false;
        boolean hasBCNFViolations = false;

        RelationSchema schema = new RelationSchema("TEMP", attributes, fds);
        Set<String> candidateKey = schema.getPrimaryKey();

        if (candidateKey.isEmpty()) return NormalizationLevel.ONE_NF;

        for (FunctionalDependency fd : fds) {
            if (!fd.isTrivial()) {
                Set<String> closure = schema.computeClosure(fd.getLeftSide());
                if (!closure.containsAll(attributes)) {
                    if (fd.isPartialDependency(candidateKey)) {
                        hasPartialDeps = true;
                    } else if (!candidateKey.containsAll(fd.getLeftSide())) {
                        hasTransitiveDeps = true;
                    }
                    if (!closure.containsAll(attributes)) {
                        hasBCNFViolations = true;
                    }
                }
            }
        }

        if (!hasPartialDeps && !hasTransitiveDeps && !hasBCNFViolations) return NormalizationLevel.BCNF;
        if (!hasPartialDeps && !hasTransitiveDeps) return NormalizationLevel.THREE_NF;
        if (!hasPartialDeps) return NormalizationLevel.TWO_NF;
        return NormalizationLevel.ONE_NF;
    }

    public List<RelationSchema> decomposeBCNF(Set<String> attributes, List<FunctionalDependency> fds) {
        RelationSchema schema = new RelationSchema("R", attributes, fds);
        return schema.decomposeBCNF();
    }

    public String generateCreateTableSQL(String tableName, Set<String> attributes, Set<String> primaryKey) {
        StringBuilder sql = new StringBuilder();
        sql.append("CREATE TABLE ").append(tableName).append(" (\n");
        List<String> attrs = new ArrayList<>(attributes);
        Collections.sort(attrs);
        for (int i = 0; i < attrs.size(); i++) {
            sql.append("  ").append(attrs.get(i)).append(" VARCHAR(255)");
            if (primaryKey.contains(attrs.get(i))) {
                sql.append(" PRIMARY KEY");
            }
            if (i < attrs.size() - 1) sql.append(",");
            sql.append("\n");
        }
        sql.append(");");
        return sql.toString();
    }

    public record NormalizationReport(
        NormalizationLevel currentLevel,
        List<Set<String>> candidateKeys,
        CanonicalCover canonicalCover,
        List<String> violations,
        List<String> recommendations,
        List<RelationSchema> bcnfDecomposition,
        List<String> sqlStatements
    ) {}
}
