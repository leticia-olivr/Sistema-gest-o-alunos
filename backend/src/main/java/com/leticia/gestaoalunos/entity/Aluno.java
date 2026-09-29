package com.leticia.gestaoalunos.entity;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "aluno",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_aluno_matricula", columnNames = "matricula"),
                @UniqueConstraint(name = "uk_aluno_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_aluno_cpf", columnNames = "cpf")
        }
)
public class Aluno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String matricula;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 11)
    private String cpf;

    @Column(nullable = false, length = 11)
    private String telefone;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    private byte[] foto;

    @Column(name = "foto_mime_type", length = 50)
    private String fotoMimeType;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    public Aluno() {
    }

    public Aluno(String matricula, String nome, String email, String cpf, String telefone) {
        this.matricula = matricula;
        this.nome = nome;
        this.email = email;
        this.cpf = cpf;
        this.telefone = telefone;
    }

    @PrePersist
    void definirDataCriacao() {
        if (dataCriacao == null) {
            dataCriacao = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public String getMatricula() {
        return matricula;
    }

    public String getNome() {
        return nome;
    }

    public String getEmail() {
        return email;
    }

    public String getCpf() {
        return cpf;
    }

    public String getTelefone() {
        return telefone;
    }

    public byte[] getFoto() {
        return foto;
    }

    public String getFotoMimeType() {
        return fotoMimeType;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
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

    public void setFoto(byte[] foto) {
        this.foto = foto;
    }

    public void setFotoMimeType(String fotoMimeType) {
        this.fotoMimeType = fotoMimeType;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
}