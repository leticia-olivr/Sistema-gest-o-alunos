package com.leticia.gestaoalunos.dto.response;

import java.util.List;

// Contrato da resposta paginada (espelhado em AlunoPage no front).
public record AlunoPageResponse(
        List<AlunoResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}