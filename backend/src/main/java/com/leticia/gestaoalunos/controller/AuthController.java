package com.leticia.gestaoalunos.controller;

import com.leticia.gestaoalunos.dto.request.LoginRequest;
import com.leticia.gestaoalunos.dto.response.LoginResponse;
import com.leticia.gestaoalunos.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request
    ) {
        return authService.login(request);
    }
}