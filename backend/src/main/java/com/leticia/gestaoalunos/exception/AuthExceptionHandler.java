package com.leticia.gestaoalunos.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class AuthExceptionHandler {

    private static final String INVALID_CREDENTIALS_MESSAGE =
            "Usuário ou senha incorretos.";

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException exception
    ) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse(INVALID_CREDENTIALS_MESSAGE));
    }

    @ExceptionHandler(AlunoApiException.class)
    public ResponseEntity<ErrorResponse> handleAlunoApiException(AlunoApiException exception) {
        return ResponseEntity.status(exception.getStatus())
                .body(new ErrorResponse(exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<?> handleValidation(
            MethodArgumentNotValidException exception
    ) {
                if (exception.getParameter().hasParameterAnnotation(RequestBody.class)) {
                        return ResponseEntity.badRequest()
                                        .body(new ErrorResponse("Requisição inválida."));
                }
        Map<String, String> errors = exception.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        error -> error.getDefaultMessage() == null ? "Valor inválido." : error.getDefaultMessage(),
                        (first, ignored) -> first
                ));
        return ResponseEntity.unprocessableEntity()
                .body(new ValidationErrorResponse("Dados inválidos.", errors));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException exception
    ) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse("Já existe um registro com os dados informados."));
    }

    public record ErrorResponse(String message) {
    }

    public record ValidationErrorResponse(String message, Map<String, String> errors) {
    }
}