package com.dataquest.application.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserRegistrationRequest(
    @NotBlank @Email @JsonProperty("correo") String email,
    @NotBlank @Size(min = 3, max = 50) @JsonProperty("apodo") String nickname,
    @NotBlank @Size(min = 6, max = 100) String password
) {}
