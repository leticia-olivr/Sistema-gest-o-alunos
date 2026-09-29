package com.leticia.gestaoalunos.dto.response;

import java.time.LocalDateTime;

public record AlunoResponse(
        Long id,
        String matricula,
        String nome,
        String email,
        String cpf,
        String telefone,
        Boolean ativo,
        LocalDateTime dataCriacao,
        String fotoUrl
) {
}