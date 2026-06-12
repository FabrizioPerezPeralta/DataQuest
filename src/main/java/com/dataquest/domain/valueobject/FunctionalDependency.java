package com.dataquest.domain.valueobject;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public class FunctionalDependency {
    private final Set<String> leftSide;
    private final Set<String> rightSide;

    public FunctionalDependency(Set<String> leftSide, Set<String> rightSide) {
        if (leftSide == null || leftSide.isEmpty()) {
            throw new IllegalArgumentException("Left side of FD cannot be empty");
        }
        if (rightSide == null || rightSide.isEmpty()) {
            throw new IllegalArgumentException("Right side of FD cannot be empty");
        }
        this.leftSide = Collections.unmodifiableSet(new LinkedHashSet<>(leftSide));
        this.rightSide = Collections.unmodifiableSet(new LinkedHashSet<>(rightSide));
    }

    public boolean isTrivial() {
        return leftSide.containsAll(rightSide);
    }

    public boolean isPartialDependency(Set<String> candidateKey) {
        return !leftSide.containsAll(candidateKey) && !leftSide.equals(candidateKey);
    }

    public boolean isTransitiveDependency(Set<String> candidateKey) {
        Set<String> nonKeyAttrs = new java.util.HashSet<>(rightSide);
        nonKeyAttrs.removeAll(candidateKey);
        return !leftSide.containsAll(candidateKey) && !nonKeyAttrs.isEmpty();
    }

    public boolean violatesBCNF(Set<String> candidateKey, List<FunctionalDependency> fds) {
        Set<String> closure = computeClosure(leftSide, fds);
        return !closure.containsAll(candidateKey) && !closure.equals(leftSide);
    }

    public static Set<String> computeClosure(Set<String> attrs, List<FunctionalDependency> fds) {
        Set<String> closure = new LinkedHashSet<>(attrs);
        boolean changed;
        do {
            changed = false;
            for (FunctionalDependency fd : fds) {
                if (closure.containsAll(fd.leftSide)) {
                    if (closure.addAll(fd.rightSide)) {
                        changed = true;
                    }
                }
            }
        } while (changed);
        return closure;
    }

    public Set<String> getLeftSide() { return leftSide; }
    public Set<String> getRightSide() { return rightSide; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FunctionalDependency that = (FunctionalDependency) o;
        return leftSide.equals(that.leftSide) && rightSide.equals(that.rightSide);
    }

    @Override
    public int hashCode() { return Objects.hash(leftSide, rightSide); }

    @Override
    public String toString() {
        String lhs = leftSide.stream().sorted().collect(Collectors.joining(","));
        String rhs = rightSide.stream().sorted().collect(Collectors.joining(","));
        return lhs + " -> " + rhs;
    }
}
