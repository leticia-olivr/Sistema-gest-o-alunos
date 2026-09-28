package com.leticia.gestaoalunos;

import com.leticia.gestaoalunos.dto.request.LoginRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LoginRequestValidationTests {

    private final Validator validator = Validation
            .buildDefaultValidatorFactory()
            .getValidator();

    @Test
    void acceptsValidUsernameAndPassword() {
        assertTrue(validator.validate(request("usuario123", "Senha123")).isEmpty());
        assertTrue(validator.validate(request("usuario123", "Senha123Senha123Abcd")).isEmpty());
    }

    @Test
    void rejectsInvalidUsernameAndPassword() {
        assertFalse(validator.validate(request("user 123", "Senha123")).isEmpty());
        assertFalse(validator.validate(request("usuario123", "Senha12")).isEmpty());
        assertFalse(validator.validate(request("usuario123", "Senha123Senha123Abcde")).isEmpty());
        assertFalse(validator.validate(request("usuario123", "SenhaSenha")).isEmpty());
        assertFalse(validator.validate(request("usuario123", "12345678")).isEmpty());
    }

    private LoginRequest request(String usuario, String senha) {
        LoginRequest request = new LoginRequest();
        request.setUsuario(usuario);
        request.setSenha(senha);
        return request;
    }
}