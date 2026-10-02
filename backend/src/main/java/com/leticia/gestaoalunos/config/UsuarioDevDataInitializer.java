package com.leticia.gestaoalunos.config;

import com.leticia.gestaoalunos.repository.UsuarioRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Profile("dev")
public class UsuarioDevDataInitializer implements ApplicationRunner {

    private static final String USUARIO = "leitor1234";
    private static final String SENHA = "Senha123";

    private final JdbcTemplate jdbcTemplate;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioDevDataInitializer(
            JdbcTemplate jdbcTemplate,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarioRepository.findByUsuario(USUARIO).isPresent()) {
            return;
        }

        jdbcTemplate.update(
                "INSERT INTO usuario (nome, usuario, senha, role, ativo) VALUES (?, ?, ?, ?, ?)",
                "Leitor",
                USUARIO,
                passwordEncoder.encode(SENHA),
                "LEITOR",
                true
        );
    }
}