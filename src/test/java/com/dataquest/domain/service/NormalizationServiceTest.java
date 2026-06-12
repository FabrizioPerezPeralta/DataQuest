package com.dataquest.domain.service;

import com.dataquest.domain.NormalizationLevel;
import com.dataquest.domain.valueobject.FunctionalDependency;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class NormalizationServiceTest {

    private final NormalizationService service = new NormalizationService();

    @Test
    void testComputeClosure() {
        List<FunctionalDependency> fds = List.of(
            new FunctionalDependency(Set.of("A", "B"), Set.of("C")),
            new FunctionalDependency(Set.of("C"), Set.of("D"))
        );
        Set<String> closure = service.computeClosure(Set.of("A", "B"), fds);
        assertTrue(closure.containsAll(Set.of("A", "B", "C", "D")));
    }

    @Test
    void testCandidateKeys() {
        Set<String> attrs = new LinkedHashSet<>(Set.of("A", "B", "C", "D"));
        List<FunctionalDependency> fds = List.of(
            new FunctionalDependency(Set.of("A"), Set.of("B", "C")),
            new FunctionalDependency(Set.of("B"), Set.of("D"))
        );
        var keys = service.findCandidateKeys(attrs, fds);
        assertFalse(keys.isEmpty());
        assertTrue(keys.get(0).contains("A"));
    }

    @Test
    void testDetermineNormalForm_BCNF() {
        Set<String> attrs = new LinkedHashSet<>(Set.of("A", "B", "C"));
        List<FunctionalDependency> fds = List.of(
            new FunctionalDependency(Set.of("A"), Set.of("B", "C"))
        );
        NormalizationLevel level = service.determineNormalForm(attrs, fds);
        assertEquals(NormalizationLevel.BCNF, level);
    }

    @Test
    void testDetermineNormalForm_1NF() {
        Set<String> attrs = new LinkedHashSet<>(Set.of("A", "B", "C", "D"));
        List<FunctionalDependency> fds = List.of(
            new FunctionalDependency(Set.of("A", "B"), Set.of("C")),
            new FunctionalDependency(Set.of("C"), Set.of("D"))
        );
        NormalizationLevel level = service.determineNormalForm(attrs, fds);
        assertEquals(NormalizationLevel.ONE_NF, level);
    }
}
