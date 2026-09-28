package com.leticia.gestaoalunos;

import com.leticia.gestaoalunos.entity.Usuario;
import com.leticia.gestaoalunos.security.JwtService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTests {

    @Test
    void signsAndValidatesTokenWithConfiguredSecret() {
        JwtService jwtService = new JwtService(
                "test-only-jwt-secret-not-for-production-0123456789abcdef"
        );
        Usuario usuario = new Usuario(
                "Usuário teste",
                "usuario123",
                "hash-da-senha",
                "ADMIN",
                true
        );

        String token = jwtService.generateToken(usuario);

        assertEquals("usuario123", jwtService.extractUsuario(token));
        assertTrue(jwtService.isTokenValid(token, usuario));
    }
}