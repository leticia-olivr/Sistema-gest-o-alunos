package com.leticia.gestaoalunos.dto.response;

import java.util.List;

public record AlunoPageResponse(
        List<AlunoResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}