package com.leticia.gestaoalunos.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

public class AlunoUpdateRequest {

    @NotBlank
    @Size(min = 3, max = 120)
    @Pattern(regexp = "^[\\p{L}\\p{M}]+(?:[ '\\-][\\p{L}\\p{M}]+)*$")
    private String nome;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @NotBlank
    private String telefone;

    private MultipartFile foto;
    private Boolean ativo;
    private boolean removerFoto;

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getTelefone() {
        return telefone;
    }

    public MultipartFile getFoto() {
        return foto;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public boolean isRemoverFoto() {
        return removerFoto;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public void setFoto(MultipartFile foto) {
        this.foto = foto;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public void setRemoverFoto(boolean removerFoto) {
        this.removerFoto = removerFoto;
    }
}