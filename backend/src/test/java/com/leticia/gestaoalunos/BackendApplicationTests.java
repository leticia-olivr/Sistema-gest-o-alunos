package com.leticia.gestaoalunos;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.DefaultApplicationArguments;
import com.leticia.gestaoalunos.config.AlunoDevDataInitializer;
import com.leticia.gestaoalunos.config.UsuarioDevDataInitializer;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(properties = "jwt.secret=test-only-jwt-secret-not-for-production-0123456789abcdef")
class BackendApplicationTests {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private AlunoDevDataInitializer alunoDevDataInitializer;

	@Autowired
	private UsuarioDevDataInitializer usuarioDevDataInitializer;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Test
	void contextLoads() {
	}

	@Test
	void alunoTableIsCreatedWithUniqueConstraints() {
		Integer tableCount = jdbcTemplate.queryForObject(
				"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ALUNO'",
				Integer.class
		);
		Integer uniqueConstraintCount = jdbcTemplate.queryForObject(
				"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS " +
						"WHERE TABLE_NAME = 'ALUNO' AND CONSTRAINT_TYPE = 'UNIQUE'",
				Integer.class
		);

		assertEquals(1, tableCount);
		assertEquals(3, uniqueConstraintCount);
	}

	@Test
	void developmentInitializerProvidesAtLeastTwentyFiveStudents() throws Exception {
		jdbcTemplate.update("DELETE FROM aluno");
		alunoDevDataInitializer.run(new DefaultApplicationArguments());

		Integer alunoCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM aluno", Integer.class);
		assertEquals(25, alunoCount);
	}

	@Test
	void developmentInitializerCreatesReaderAccountWithEncodedPassword() throws Exception {
		jdbcTemplate.update("DELETE FROM usuario WHERE usuario = ?", "leitor1234");
		usuarioDevDataInitializer.run(new DefaultApplicationArguments());
		usuarioDevDataInitializer.run(new DefaultApplicationArguments());

		String[] leitor = jdbcTemplate.queryForObject(
				"SELECT role, senha FROM usuario WHERE usuario = ?",
				(resultSet, rowNum) -> new String[]{resultSet.getString("role"), resultSet.getString("senha")},
				"leitor1234"
		);

		assertEquals("LEITOR", leitor[0]);
		assertEquals(true, passwordEncoder.matches("Senha123", leitor[1]));
		assertEquals(1, jdbcTemplate.queryForObject(
				"SELECT COUNT(*) FROM usuario WHERE usuario = ?",
				Integer.class,
				"leitor1234"
		));
	}

}
