package com.dataquest.bdd;

import com.dataquest.domain.NormalizationLevel;
import com.dataquest.domain.service.NormalizationService;
import com.dataquest.domain.valueobject.FunctionalDependency;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

public class NormalizationSteps {

    @Autowired
    private NormalizationService normalizationService;

    private Set<String> attributes;
    private List<FunctionalDependency> fds;
    private NormalizationLevel result;
    private List<String> violations;

    @Given("a relation {string} with attributes {string}")
    public void aRelationWithAttributes(String name, String attrs) {
        this.attributes = Arrays.stream(attrs.split(","))
            .map(String::trim)
            .collect(Collectors.toCollection(LinkedHashSet::new));
        this.fds = new ArrayList<>();
    }

    @Given("functional dependencies:")
    public void functionalDependencies(io.cucumber.datatable.DataTable table) {
        List<String> deps = table.asList(String.class);
        for (String dep : deps) {
            String[] parts = dep.split("->");
            Set<String> lhs = Arrays.stream(parts[0].trim().split(","))
                .map(String::trim).collect(Collectors.toSet());
            Set<String> rhs;
            if (parts[1].contains(",")) {
                rhs = Arrays.stream(parts[1].trim().split(","))
                    .map(String::trim).collect(Collectors.toSet());
            } else {
                rhs = Set.of(parts[1].trim());
            }
            fds.add(new FunctionalDependency(lhs, rhs));
        }
    }

    @When("I analyze the normalization level")
    public void iAnalyzeTheNormalizationLevel() {
        result = normalizationService.determineNormalForm(attributes, fds);
    }

    @Then("the current normal form should be {string}")
    public void theCurrentNormalFormShouldBe(String level) {
        assertEquals(NormalizationLevel.valueOf(level), result);
    }

    @Then("the violations should include {string}")
    public void theViolationsShouldInclude(String violation) {
        assertNotNull(violation);
    }
}
