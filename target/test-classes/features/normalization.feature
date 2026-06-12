Feature: Database Normalization Analysis
  As a student
  I want to analyze relation schemas
  To learn about database normalization

  Scenario: Analyze BCNF schema
    Given a relation "R" with attributes "A, B, C"
    And functional dependencies:
      | dependency |
      | A -> B, C   |
    When I analyze the normalization level
    Then the current normal form should be "BCNF"

  Scenario: Analyze 1NF schema with partial dependencies
    Given a relation "R" with attributes "A, B, C, D"
    And functional dependencies:
      | dependency |
      | A, B -> C   |
      | C -> D     |
    When I analyze the normalization level
    Then the current normal form should be "ONE_NF"
    And the violations should include "dependencias parciales"
