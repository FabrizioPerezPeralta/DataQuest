package com.dataquest.application.dto;

import java.util.List;
import java.util.Set;

public record NormalizationRequest(
    Set<String> attributes,
    List<String> functionalDependencies,
    String sourceSql,
    String sourceCsv
) {}
