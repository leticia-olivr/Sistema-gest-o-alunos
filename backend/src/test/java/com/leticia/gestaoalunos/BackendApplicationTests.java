package com.leticia.gestaoalunos;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.boot.DefaultApplicationArguments;
import com.leticia.gestaoalunos.config.AlunoDevDataInitializer;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(properties = "jwt.secret=test-only-jwt-secret-not-for-production-0123456789abcdef")
class BackendApplicationTests {

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Autowired
	private AlunoDevDataInitializer alunoDevDataInitializer;

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

}
