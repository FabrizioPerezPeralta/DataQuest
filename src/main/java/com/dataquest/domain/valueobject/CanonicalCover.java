package com.dataquest.domain.valueobject;

import java.util.*;
import java.util.stream.Collectors;

public class CanonicalCover {

    private final List<FunctionalDependency> cover;

    public CanonicalCover(List<FunctionalDependency> fds) {
        this.cover = compute(fds);
    }

    private List<FunctionalDependency> compute(List<FunctionalDependency> fds) {
        List<FunctionalDependency> decomposed = new ArrayList<>();
        for (FunctionalDependency fd : fds) {
            for (String rhsAttr : fd.getRightSide()) {
                decomposed.add(new FunctionalDependency(fd.getLeftSide(), Set.of(rhsAttr)));
            }
        }

        boolean changed;
        do {
            changed = false;
            List<FunctionalDependency> newSet = new ArrayList<>();
            for (FunctionalDependency fd : decomposed) {
                Set<String> lhs = new LinkedHashSet<>(fd.getLeftSide());
                Set<String> rhs = new LinkedHashSet<>(fd.getRightSide());

                for (String attr : new LinkedHashSet<>(lhs)) {
                    Set<String> testLHS = new LinkedHashSet<>(lhs);
                    testLHS.remove(attr);

                    Set<String> closure = computeClosure(testLHS, decomposed, fd);
                    if (closure.containsAll(rhs)) {
                        lhs = testLHS;
                        changed = true;
                    }
                }

                Set<String> finalLHS = lhs;
                var existing = newSet.stream()
                    .filter(f -> f.getLeftSide().equals(finalLHS))
                    .findFirst();
                if (existing.isPresent()) {
                    Set<String> merged = new LinkedHashSet<>(existing.get().getRightSide());
                    merged.addAll(rhs);
                    newSet.remove(existing.get());
                    newSet.add(new FunctionalDependency(finalLHS, merged));
                } else {
                    newSet.add(new FunctionalDependency(finalLHS, rhs));
                }
            }
            decomposed = newSet;
        } while (changed);

        List<FunctionalDependency> minimal = new ArrayList<>(decomposed);
        boolean removed;
        do {
            removed = false;
            for (int i = 0; i < minimal.size(); i++) {
                FunctionalDependency fd = minimal.get(i);
                List<FunctionalDependency> without = new ArrayList<>(minimal);
                without.remove(i);
                Set<String> closure = computeClosure(fd.getLeftSide(), without, null);
                if (closure.containsAll(fd.getRightSide())) {
                    minimal = without;
                    removed = true;
                    break;
                }
            }
        } while (removed);

        return Collections.unmodifiableList(minimal);
    }

    private Set<String> computeClosure(Set<String> attrs, List<FunctionalDependency> fds,
                                       FunctionalDependency exclude) {
        Set<String> closure = new LinkedHashSet<>(attrs);
        boolean changed;
        do {
            changed = false;
            for (FunctionalDependency fd : fds) {
                if (fd.equals(exclude)) continue;
                if (closure.containsAll(fd.getLeftSide())) {
                    if (closure.addAll(fd.getRightSide())) {
                        changed = true;
                    }
                }
            }
        } while (changed);
        return closure;
    }

    public List<FunctionalDependency> getCover() { return cover; }

    @Override
    public String toString() {
        return cover.stream()
            .map(FunctionalDependency::toString)
            .collect(Collectors.joining(", "));
    }
}
