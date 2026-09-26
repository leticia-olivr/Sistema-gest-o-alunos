package com.leticia.gestaoalunos.dto.request;

import org.jspecify.annotations.Nullable;

public class LoginRequest {
    private String email;
    private String senha;

    public String getEmail() {
        return email;
    }

    public String getSenha() {
        return senha;
    }
}
