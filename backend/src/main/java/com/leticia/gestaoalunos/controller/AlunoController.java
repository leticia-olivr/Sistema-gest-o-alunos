package com.leticia.gestaoalunos.controller;

import com.leticia.gestaoalunos.dto.request.AlunoCreateRequest;
import com.leticia.gestaoalunos.dto.request.AlunoUpdateRequest;
import com.leticia.gestaoalunos.dto.response.AlunoPageResponse;
import com.leticia.gestaoalunos.dto.response.AlunoResponse;
import com.leticia.gestaoalunos.service.AlunoService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping("/api/alunos")
public class AlunoController {

    private final AlunoService alunoService;

    public AlunoController(AlunoService alunoService) {
        this.alunoService = alunoService;
    }

    @PostMapping(consumes = MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AlunoResponse> criar(@Valid @ModelAttribute AlunoCreateRequest request) {
        AlunoResponse aluno = alunoService.criar(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(aluno.id())
                .toUri();
        return ResponseEntity.created(location).body(aluno);
    }

    // Listagem paginada com filtros opcionais.
    @GetMapping
    public AlunoPageResponse listar(
            @RequestParam(required = false) String busca,
            @RequestParam(defaultValue = "ATIVOS") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return alunoService.listar(busca, status, page, size);
    }

    @GetMapping("/{id}")
    public AlunoResponse buscarPorId(@PathVariable Long id) {
        return alunoService.buscarPorId(id);
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> buscarFoto(@PathVariable Long id) {
        AlunoService.FotoAluno foto = alunoService.buscarFoto(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(foto.mimeType()))
                .cacheControl(CacheControl.noCache())
                .body(foto.conteudo());
    }

    @PutMapping(value = "/{id}", consumes = MULTIPART_FORM_DATA_VALUE)
    public AlunoResponse atualizar(
            @PathVariable Long id,
            @Valid @ModelAttribute AlunoUpdateRequest request
    ) {
        return alunoService.atualizar(id, request);
    }

    @PatchMapping("/{id}/inativar")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        alunoService.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reativar")
    public ResponseEntity<Void> reativar(@PathVariable Long id) {
        alunoService.reativar(id);
        return ResponseEntity.noContent().build();
    }
}