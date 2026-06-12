package com.dataquest.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
    @NotBlank @Email @JsonProperty("correo") String email,
    @NotBlank String password
) {}
