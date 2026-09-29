package com.leticia.gestaoalunos.exception;

import org.springframework.http.HttpStatus;

public class AlunoApiException extends RuntimeException {

    private final HttpStatus status;

    public AlunoApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}