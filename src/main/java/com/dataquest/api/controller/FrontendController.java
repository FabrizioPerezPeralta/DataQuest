package com.dataquest.api.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Controller
public class FrontendController {
    @GetMapping(value = {"/", "/login", "/dashboard", "/learning", "/normalize",
                         "/admin", "/academia", "/comunidad", "/laboratorio", "/validador"})
    public String serveFrontend() {
        return "forward:/frontend/index.html";
    }
}
