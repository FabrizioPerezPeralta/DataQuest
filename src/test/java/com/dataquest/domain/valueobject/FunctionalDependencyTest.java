package com.dataquest.domain.valueobject;

import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class FunctionalDependencyTest {

    @Test
    void testTrivialDependency() {
        FunctionalDependency fd = new FunctionalDependency(Set.of("A", "B"), Set.of("A"));
        assertTrue(fd.isTrivial());
    }

    @Test
    void testNonTrivialDependency() {
        FunctionalDependency fd = new FunctionalDependency(Set.of("A", "B"), Set.of("C"));
        assertFalse(fd.isTrivial());
    }

    @Test
    void testEmptyLeftSideThrows() {
        assertThrows(IllegalArgumentException.class, () ->
            new FunctionalDependency(Set.of(), Set.of("A")));
    }

    @Test
    void testEmptyRightSideThrows() {
        assertThrows(IllegalArgumentException.class, () ->
            new FunctionalDependency(Set.of("A"), Set.of()));
    }

    @Test
    void testPartialDependency() {
        FunctionalDependency fd = new FunctionalDependency(Set.of("A"), Set.of("C"));
        assertTrue(fd.isPartialDependency(Set.of("A", "B")));
    }

    @Test
    void testToString() {
        FunctionalDependency fd = new FunctionalDependency(Set.of("A", "B"), Set.of("C", "D"));
        String str = fd.toString();
        assertTrue(str.contains("A"));
        assertTrue(str.contains("B"));
        assertTrue(str.contains("C"));
        assertTrue(str.contains("D"));
        assertTrue(str.contains("->"));
    }
}
