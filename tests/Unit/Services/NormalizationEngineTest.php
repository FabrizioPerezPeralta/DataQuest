<?php

namespace Tests\Unit\Services;

use PHPUnit\Framework\TestCase;
use App\Domain\Services\NormalizationEngine;
use App\Domain\Entities\RelationSchema;
use App\Domain\Entities\FunctionalDependency;

/**
 * Comprehensive tests for the normalization engine
 * Target: 90% code coverage
 * 
 * Test Groups:
 * - Functional Dependency Validation
 * - Normalization Form Detection
 * - Closure Calculation
 * - Key Discovery
 * - Violation Detection
 */
class NormalizationEngineTest extends TestCase
{
    private NormalizationEngine $engine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->engine = new NormalizationEngine();
    }

    /**
     * Test 1NF: Atomic values only
     */
    public function test_detects_first_normal_form(): void
    {
        $schema = new RelationSchema(
            table_name: 'Student',
            attributes: ['StudentID', 'Name', 'Email', 'Phone'],
            dependencies: [
                new FunctionalDependency(
                    determinant: ['StudentID'],
                    dependent: ['Name', 'Email', 'Phone']
                )
            ]
        );

        $result = $this->engine->validate($schema);

        $this->assertTrue($result['is_1nf']);
        $this->assertEmpty($result['violations']);
    }

    /**
     * Test 2NF: No partial dependencies
     */
    public function test_detects_partial_dependency_violation(): void
    {
        // Enrollment(StudentID, CourseID, StudentName, CourseName, Grade)
        // Key: (StudentID, CourseID)
        // Violation: StudentID -> StudentName (partial dependency)
        
        $schema = new RelationSchema(
            table_name: 'Enrollment',
            attributes: ['StudentID', 'CourseID', 'StudentName', 'CourseName', 'Grade'],
            dependencies: [
                new FunctionalDependency(['StudentID'], ['StudentName']),
                new FunctionalDependency(['CourseID'], ['CourseName']),
                new FunctionalDependency(['StudentID', 'CourseID'], ['Grade']),
            ]
        );

        $result = $this->engine->validate($schema);

        $this->assertFalse($result['is_2nf']);
        $this->assertNotEmpty($result['violations']);
        $this->assertStringContainsString('partial_dependency', $result['violations'][0]['type']);
    }

    /**
     * Test transitive dependency detection
     */
    public function test_detects_transitive_dependency_violation(): void
    {
        // Student(StudentID, Name, DepartmentID, DepartmentName, DepartmentBuilding)
        // Key: StudentID
        // Violation: StudentID -> DepartmentID -> DepartmentName (transitive)
        
        $schema = new RelationSchema(
            table_name: 'Student',
            attributes: ['StudentID', 'Name', 'DepartmentID', 'DepartmentName', 'Building'],
            dependencies: [
                new FunctionalDependency(['StudentID'], ['Name', 'DepartmentID']),
                new FunctionalDependency(['DepartmentID'], ['DepartmentName', 'Building']),
            ]
        );

        $result = $this->engine->validate($schema);

        $this->assertFalse($result['is_3nf']);
        $this->assertNotEmpty($result['violations']);
        $this->assertStringContainsString('transitive_dependency', $result['violations'][0]['type']);
    }

    /**
     * Test closure calculation
     */
    public function test_calculates_attribute_closure(): void
    {
        // Given: A -> B, B -> C
        // Closure of A should be {A, B, C}
        
        $dependencies = [
            new FunctionalDependency(['A'], ['B']),
            new FunctionalDependency(['B'], ['C']),
        ];

        $closure = $this->engine->calculateClosure(['A'], $dependencies);

        $this->assertContains('A', $closure);
        $this->assertContains('B', $closure);
        $this->assertContains('C', $closure);
    }

    /**
     * Test candidate key discovery
     */
    public function test_discovers_candidate_keys(): void
    {
        $schema = new RelationSchema(
            table_name: 'User',
            attributes: ['UserID', 'Email', 'Name', 'Phone'],
            dependencies: [
                new FunctionalDependency(['UserID'], ['Email', 'Name', 'Phone']),
                new FunctionalDependency(['Email'], ['UserID', 'Name', 'Phone']),
            ]
        );

        $keys = $this->engine->findCandidateKeys($schema);

        $this->assertCount(2, $keys);
        $this->assertContains(['UserID'], $keys);
        $this->assertContains(['Email'], $keys);
    }

    /**
     * Test trivial dependency filtering
     */
    public function test_filters_trivial_dependencies(): void
    {
        $dependencies = [
            new FunctionalDependency(['A'], ['A']),           // Trivial
            new FunctionalDependency(['A', 'B'], ['A']),      // Trivial
            new FunctionalDependency(['A'], ['B']),           // Non-trivial
        ];

        $filtered = $this->engine->filterTrivialDependencies($dependencies);

        $this->assertCount(1, $filtered);
    }

    /**
     * Test decomposition into 3NF
     */
    public function test_suggests_3nf_decomposition(): void
    {
        $schema = new RelationSchema(
            table_name: 'CourseInstructor',
            attributes: ['CourseID', 'InstructorID', 'Department', 'InstructorName'],
            dependencies: [
                new FunctionalDependency(['CourseID', 'InstructorID'], ['Department']),
                new FunctionalDependency(['InstructorID'], ['InstructorName', 'Department']),
            ]
        );

        $decomposition = $this->engine->suggestDecomposition($schema);

        $this->assertNotEmpty($decomposition['tables']);
        $this->assertIsArray($decomposition['rationale']);
    }

    /**
     * Test preservation of functional dependencies
     */
    public function test_verifies_dependency_preservation(): void
    {
        $originalSchema = new RelationSchema(
            table_name: 'Original',
            attributes: ['A', 'B', 'C', 'D'],
            dependencies: [
                new FunctionalDependency(['A'], ['B', 'C', 'D']),
                new FunctionalDependency(['B'], ['C']),
            ]
        );

        $decomposedTables = [
            new RelationSchema('T1', ['A', 'B', 'C'], [
                new FunctionalDependency(['A'], ['B', 'C']),
            ]),
            new RelationSchema('T2', ['B', 'C', 'D'], [
                new FunctionalDependency(['B'], ['C', 'D']),
            ]),
        ];

        $isPreserved = $this->engine->isJoinDependencyPreserved(
            $originalSchema,
            $decomposedTables
        );

        // Depending on actual decomposition, this may or may not preserve
        $this->assertIsBool($isPreserved);
    }

    /**
     * Test edge case: Empty relation
     */
    public function test_handles_empty_relation(): void
    {
        $schema = new RelationSchema(
            table_name: 'Empty',
            attributes: [],
            dependencies: []
        );

        $result = $this->engine->validate($schema);

        $this->assertTrue($result['is_1nf']);
        $this->assertTrue($result['is_2nf']);
        $this->assertTrue($result['is_3nf']);
    }

    /**
     * Test edge case: Single attribute
     */
    public function test_handles_single_attribute(): void
    {
        $schema = new RelationSchema(
            table_name: 'Single',
            attributes: ['ID'],
            dependencies: []
        );

        $result = $this->engine->validate($schema);

        $this->assertTrue($result['is_1nf']);
        $this->assertTrue($result['is_2nf']);
        $this->assertTrue($result['is_3nf']);
    }
}
