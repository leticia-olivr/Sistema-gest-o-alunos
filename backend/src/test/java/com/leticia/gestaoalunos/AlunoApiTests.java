package com.leticia.gestaoalunos;

import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Year;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "jwt.secret=test-only-jwt-secret-not-for-production-0123456789abcdef")
@AutoConfigureMockMvc
class AlunoApiTests {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MockMvc mockMvc;

        private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private String adminToken;
    private String readerToken;

    @BeforeEach
    void prepareDatabaseAndTokens() {
        jdbcTemplate.update("DELETE FROM aluno");
        jdbcTemplate.update("DELETE FROM usuario WHERE usuario = ?", "leitor1234");
        jdbcTemplate.update(
                "INSERT INTO usuario (nome, usuario, senha, role, ativo) VALUES (?, ?, ?, ?, ?)",
                "Leitor de teste", "leitor1234", "hash-de-teste", "LEITOR", true
        );
        adminToken = jwtService.generateToken(usuarioRepository.findByUsuario("admin1234").orElseThrow());
        readerToken = jwtService.generateToken(new Usuario(
                "Leitor de teste", "leitor1234", "hash-de-teste", "LEITOR", true
        ));
    }

    @Test
    void createsListsUpdatesAndInactivatesStudents() throws Exception {
        MvcResult createResult = mockMvc.perform(createRequest("Ana Souza", "ana@example.com", "529.982.247-25"))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.ativo").value(true))
                        .andReturn();
        JsonNode created = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long id = created.get("id").asLong();
        String matricula = created.get("matricula").asText();
        assertTrue(matricula.matches("[0-9]{8}"));
        assertTrue(matricula.startsWith(String.valueOf(Year.now().getValue())));
        assertEquals("52998224725", created.get("cpf").asText());
        assertEquals("11987654321", created.get("telefone").asText());

        mockMvc.perform(get("/api/alunos")
                        .header("Authorization", bearer(readerToken))
                        .param("busca", "  ANA  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].matricula").value(matricula));

        mockMvc.perform(get("/api/alunos/" + id)
                        .header("Authorization", bearer(readerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Ana Souza"));

        mockMvc.perform(multipart("/api/alunos/" + id)
                        .param("nome", "Ana Silva")
                        .param("email", "ana.silva@example.com")
                        .param("telefone", "(11) 98765-4321")
                        .param("ativo", "true")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Ana Silva"))
                .andExpect(jsonPath("$.cpf").value("52998224725"));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                        .patch("/api/alunos/" + id + "/inativar")
                        .header("Authorization", bearer(adminToken)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/alunos").header("Authorization", bearer(readerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(0));
        mockMvc.perform(get("/api/alunos").param("status", "INATIVOS")
                        .header("Authorization", bearer(readerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void rejectsInvalidCpfAndDuplicateEmail() throws Exception {
        mockMvc.perform(createRequest("A1", "ana@example.com", "529.982.247-25"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.errors.nome").exists());

        mockMvc.perform(createRequest("Ana Souza", "ana@example.com", "111.111.111-11"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("CPF inválido."));

        mockMvc.perform(createRequest("Ana Souza", "ana@example.com", "529.982.247-25"))
                .andExpect(status().isCreated());
        mockMvc.perform(createRequest("Outra Pessoa", "ANA@example.com", "111.444.777-35"))
                .andExpect(status().isConflict());
    }

    @Test
    void readersCanReadButCannotWriteAndInvalidPhotoIsRejected() throws Exception {
        mockMvc.perform(createRequest("Ana Souza", "ana@example.com", "529.982.247-25")
                        .headers(headers -> headers.set("Authorization", bearer(readerToken))))
                .andExpect(status().isForbidden());

        MockMultipartFile invalidPhoto = new MockMultipartFile(
                "foto", "foto.png", "image/png", "not-an-image".getBytes()
        );
        mockMvc.perform(createRequest("Ana Souza", "ana@example.com", "529.982.247-25")
                        .file(invalidPhoto))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("A foto deve ser uma imagem JPEG ou PNG válida."));

        MockMultipartFile oversizedPhoto = new MockMultipartFile(
                "foto", "foto.png", "image/png", new byte[5 * 1024 * 1024 + 1]
        );
        mockMvc.perform(createRequest("Ana Souza", "ana@example.com", "529.982.247-25")
                        .file(oversizedPhoto))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.message").value("A foto deve ter no máximo 5 MB."));
    }

    private org.springframework.test.web.servlet.request.MockMultipartHttpServletRequestBuilder createRequest(
            String nome,
            String email,
            String cpf
    ) {
        return multipart("/api/alunos")
                .param("nome", nome)
                .param("email", email)
                .param("cpf", cpf)
                .param("telefone", "11987654321")
                .header("Authorization", bearer(adminToken));
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}