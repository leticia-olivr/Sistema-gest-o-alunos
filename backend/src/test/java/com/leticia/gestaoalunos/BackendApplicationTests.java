package com.leticia.gestaoalunos;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "jwt.secret=test-only-jwt-secret-not-for-production-0123456789abcdef")
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
