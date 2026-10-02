package com.leticia.gestaoalunos;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leticia.gestaoalunos.entity.Usuario;
import com.leticia.gestaoalunos.repository.UsuarioRepository;
import com.leticia.gestaoalunos.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "jwt.secret=test-only-jwt-secret-not-for-production-0123456789abcdef")
@AutoConfigureMockMvc
class GlobalExceptionHandlerTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

        private Long alunoId;

    @BeforeEach
    void createReaderAccount() {
                jdbcTemplate.update("DELETE FROM aluno");
                jdbcTemplate.update(
                                "INSERT INTO aluno (matricula, nome, email, cpf, telefone, ativo) VALUES (?, ?, ?, ?, ?, ?)",
                                "A26000000000000001",
                                "Aluno de teste",
                                "aluno.teste@example.com",
                                "52998224725",
                                "11987654321",
                                true
                );
                alunoId = jdbcTemplate.queryForObject(
                                "SELECT id FROM aluno WHERE matricula = ?",
                                Long.class,
                                "A26000000000000001"
                );
        jdbcTemplate.update("DELETE FROM usuario WHERE usuario = ?", "leitor1234");
        jdbcTemplate.update(
                "INSERT INTO usuario (nome, usuario, senha, role, ativo) VALUES (?, ?, ?, ?, ?)",
                "Leitor de teste",
                "leitor1234",
                passwordEncoder.encode("Senha123"),
                "LEITOR",
                true
        );
    }

    @Test
    void returnsSameUnauthorizedResponseForUnknownUserAndWrongPassword()
            throws Exception {
        String genericError = """
                {"message":"Usuário ou senha incorretos."}
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"usuario":"usuario999","senha":"Senha123"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(content().json(genericError));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"usuario":"admin1234","senha":"Senha999"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(content().json(genericError));
    }

    @Test
    void keepsBadRequestForInvalidCredentialFormat() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"usuario":"usuario999","senha":"12345678"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rejectsMalformedJwtAsUnauthorizedOnProtectedRoute() throws Exception {
        mockMvc.perform(get("/api/protected-test")
                        .header("Authorization", "Bearer malformed-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authorizesReadForReaderAndRestrictsWritesToAdmin() throws Exception {
        String readerToken = jwtService.generateToken(new Usuario(
                "Leitor de teste",
                "leitor1234",
                "hash-de-teste",
                "LEITOR",
                true
        ));
        String adminToken = jwtService.generateToken(
                usuarioRepository.findByUsuario("admin1234").orElseThrow()
        );

        mockMvc.perform(get("/api/alunos/" + alunoId)
                        .header("Authorization", "Bearer " + readerToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/alunos/1")
                        .header("Authorization", "Bearer " + readerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/alunos/1")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void validLoginReturnsTokenThatCanReadStudentApi() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"usuario":"leitor1234","senha":"Senha123"}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        String token = objectMapper
                .readTree(loginResult.getResponse().getContentAsString())
                .get("token")
                .asText();

        mockMvc.perform(get("/api/alunos/" + alunoId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void seededAdminCanLoginWithDevelopmentPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"usuario":"admin1234","senha":"Senha123"}
                                """))
                .andExpect(status().isOk());
    }
}