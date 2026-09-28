package com.leticia.gestaoalunos.service;

import com.leticia.gestaoalunos.dto.request.LoginRequest;
import com.leticia.gestaoalunos.dto.response.LoginResponse;
import com.leticia.gestaoalunos.entity.Usuario;
import com.leticia.gestaoalunos.repository.UsuarioRepository;
import com.leticia.gestaoalunos.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UsuarioRepository usuarioRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {

        Usuario usuario = usuarioRepository
            .findByUsuario(request.getUsuario())
                .orElseThrow(() ->
                        new RuntimeException("Usuário não encontrado"));

        boolean senhaValida = passwordEncoder.matches(
                request.getSenha(),
                usuario.getSenha()
        );

        if (!senhaValida) {
            throw new RuntimeException("Credenciais inválidas");
        }

        String token = jwtService.generateToken(usuario);

        return new LoginResponse(token);
    }
}
