package com.dataquest.domain.valueobject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class RelationSchema {
    private final String name;
    private final Set<String> attributes;
    private final List<FunctionalDependency> functionalDependencies;
    private final Set<String> primaryKey;

    public RelationSchema(String name, Set<String> attributes,
                          List<FunctionalDependency> functionalDependencies) {
        this.name = name;
        this.attributes = Collections.unmodifiableSet(new LinkedHashSet<>(attributes));
        this.functionalDependencies = Collections.unmodifiableList(
            functionalDependencies != null ? functionalDependencies : List.of()
        );
        List<Set<String>> candidateKeys = findCandidateKeys();
        this.primaryKey = candidateKeys.isEmpty()
            ? Collections.emptySet()
            : candidateKeys.get(0);
    }

    public Set<String> computeClosure(Set<String> attrs) {
        Set<String> closure = new LinkedHashSet<>(attrs);
        boolean changed;
        do {
            changed = false;
            for (FunctionalDependency fd : functionalDependencies) {
                if (closure.containsAll(fd.getLeftSide())) {
                    if (closure.addAll(fd.getRightSide())) {
                        changed = true;
                    }
                }
            }
        } while (changed);
        return closure;
    }

    public List<Set<String>> findCandidateKeys() {
        Set<String> singleAttrs = new LinkedHashSet<>();
        for (FunctionalDependency fd : functionalDependencies) {
            singleAttrs.addAll(fd.getLeftSide());
            singleAttrs.addAll(fd.getRightSide());
        }
        singleAttrs.retainAll(attributes);

        if (singleAttrs.isEmpty()) return List.of();

        List<Set<String>> candidates = new ArrayList<>();

        for (String attr : singleAttrs) {
            Set<String> testSet = new LinkedHashSet<>();
            testSet.add(attr);
            Set<String> closure = computeClosure(testSet);
            if (closure.containsAll(attributes)) {
                candidates.add(testSet);
            }
        }

        if (candidates.isEmpty()) {
            for (int size = 2; size <= Math.min(4, singleAttrs.size()); size++) {
                List<Set<String>> combinations = generateCombinations(singleAttrs, size);
                for (Set<String> combo : combinations) {
                    Set<String> closure = computeClosure(combo);
                    if (closure.containsAll(attributes)) {
                        boolean isMinimal = true;
                        for (Set<String> existing : candidates) {
                            if (combo.containsAll(existing)) {
                                isMinimal = false;
                                break;
                            }
                        }
                        if (isMinimal) {
                            candidates.add(combo);
                        }
                    }
                }
                if (!candidates.isEmpty()) break;
            }
        }

        return candidates;
    }

    private List<Set<String>> generateCombinations(Set<String> elements, int size) {
        List<String> list = new ArrayList<>(elements);
        List<Set<String>> result = new ArrayList<>();
        generateCombinationsHelper(list, size, 0, new LinkedHashSet<>(), result);
        return result;
    }

    private void generateCombinationsHelper(List<String> elements, int size, int start,
                                            Set<String> current, List<Set<String>> result) {
        if (current.size() == size) {
            result.add(new LinkedHashSet<>(current));
            return;
        }
        for (int i = start; i < elements.size(); i++) {
            current.add(elements.get(i));
            generateCombinationsHelper(elements, size, i + 1, current, result);
            current.remove(elements.get(i));
        }
    }

    public boolean isInBCNF() {
        Set<String> candidateKey = primaryKey;
        if (candidateKey.isEmpty()) return false;
        for (FunctionalDependency fd : functionalDependencies) {
            if (!fd.isTrivial()) {
                Set<String> closure = computeClosure(fd.getLeftSide());
                if (!closure.containsAll(attributes)) {
                    return false;
                }
            }
        }
        return true;
    }

    public boolean isIn3NF() {
        if (isInBCNF()) return true;
        Set<String> candidateKey = primaryKey;
        if (candidateKey.isEmpty()) return false;
        for (FunctionalDependency fd : functionalDependencies) {
            if (!fd.isTrivial()) {
                Set<String> closure = computeClosure(fd.getLeftSide());
                if (!closure.containsAll(attributes)) {
                    boolean rhsInKey = candidateKey.containsAll(fd.getRightSide());
                    if (!rhsInKey) return false;
                }
            }
        }
        return true;
    }

    public List<RelationSchema> decomposeBCNF() {
        List<RelationSchema> result = new ArrayList<>();
        decomposeBCNFRecursive(this, result);
        return result;
    }

    private void decomposeBCNFRecursive(RelationSchema schema, List<RelationSchema> result) {
        if (schema.isInBCNF()) {
            result.add(schema);
            return;
        }
        for (FunctionalDependency fd : schema.functionalDependencies) {
            if (!fd.isTrivial()) {
                Set<String> closure = schema.computeClosure(fd.getLeftSide());
                if (!closure.containsAll(schema.attributes)) {
                    Set<String> r1Attrs = new LinkedHashSet<>(fd.getLeftSide());
                    r1Attrs.addAll(closure);
                    r1Attrs.retainAll(schema.attributes);

                    Set<String> r2Attrs = new LinkedHashSet<>(schema.attributes);
                    r2Attrs.removeAll(closure);
                    r2Attrs.addAll(fd.getLeftSide());

                    List<FunctionalDependency> r1FDs = projectFDs(schema.functionalDependencies, r1Attrs);
                    List<FunctionalDependency> r2FDs = projectFDs(schema.functionalDependencies, r2Attrs);

                    decomposeBCNFRecursive(
                        new RelationSchema(schema.name + "_1", r1Attrs, r1FDs), result);
                    decomposeBCNFRecursive(
                        new RelationSchema(schema.name + "_2", r2Attrs, r2FDs), result);
                    return;
                }
            }
        }
        result.add(schema);
    }

    private List<FunctionalDependency> projectFDs(List<FunctionalDependency> fds, Set<String> attrs) {
        List<FunctionalDependency> result = new ArrayList<>();
        for (FunctionalDependency fd : fds) {
            Set<String> newLHS = new LinkedHashSet<>(fd.getLeftSide());
            newLHS.retainAll(attrs);
            Set<String> newRHS = new LinkedHashSet<>(fd.getRightSide());
            newRHS.retainAll(attrs);
            if (!newLHS.isEmpty() && !newRHS.isEmpty()) {
                result.add(new FunctionalDependency(newLHS, newRHS));
            }
        }
        return result;
    }

    public String getName() { return name; }
    public Set<String> getAttributes() { return attributes; }
    public List<FunctionalDependency> getFunctionalDependencies() { return functionalDependencies; }
    public Set<String> getPrimaryKey() { return primaryKey; }
}
