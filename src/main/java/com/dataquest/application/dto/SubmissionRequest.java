package com.dataquest.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record SubmissionRequest(
    @NotNull @JsonProperty("level_id") Long levelId,
    @JsonProperty("respuesta") String solution,
    boolean usedHints,
    Map<String, Object> metadata
) {}
