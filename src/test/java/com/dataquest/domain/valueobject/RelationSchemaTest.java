package com.dataquest.domain.valueobject;

import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;

class RelationSchemaTest {

    @Test
    void testComputeClosure() {
        RelationSchema schema = new RelationSchema("R",
            new LinkedHashSet<>(Set.of("A", "B", "C", "D")),
            List.of(
                new FunctionalDependency(Set.of("A"), Set.of("B")),
                new FunctionalDependency(Set.of("B"), Set.of("C"))
            )
        );
        Set<String> closure = schema.computeClosure(Set.of("A"));
        assertTrue(closure.containsAll(Set.of("A", "B", "C")));
    }

    @Test
    void testBCNFDecomposition() {
        RelationSchema schema = new RelationSchema("R",
            new LinkedHashSet<>(Set.of("A", "B", "C", "D")),
            List.of(
                new FunctionalDependency(Set.of("A", "B"), Set.of("C")),
                new FunctionalDependency(Set.of("C"), Set.of("D"))
            )
        );
        assertFalse(schema.isInBCNF());
        List<RelationSchema> decomposed = schema.decomposeBCNF();
        assertTrue(decomposed.size() >= 2);
    }

    @Test
    void testIsInBCNF() {
        RelationSchema schema = new RelationSchema("R",
            new LinkedHashSet<>(Set.of("A", "B", "C")),
            List.of(
                new FunctionalDependency(Set.of("A"), Set.of("B", "C"))
            )
        );
        assertTrue(schema.isInBCNF());
    }
}
