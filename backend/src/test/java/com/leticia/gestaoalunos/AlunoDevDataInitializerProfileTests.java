package com.leticia.gestaoalunos;

import com.leticia.gestaoalunos.config.AlunoDevDataInitializer;
import com.leticia.gestaoalunos.config.UsuarioDevDataInitializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(properties = "jwt.secret=test-only-jwt-secret-not-for-production-0123456789abcdef")
@ActiveProfiles("prod")
class AlunoDevDataInitializerProfileTests {

    @Autowired
    private ApplicationContext applicationContext;

    @Test
    void doesNotRegisterDemoDataInitializerInProductionProfile() {
        assertTrue(applicationContext.getBeansOfType(AlunoDevDataInitializer.class).isEmpty());
        assertTrue(applicationContext.getBeansOfType(UsuarioDevDataInitializer.class).isEmpty());
    }
}