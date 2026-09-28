package com.leticia.gestaoalunos.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 50)
    private String usuario;

    @Column(nullable = false)
    private String senha;

    @Column(nullable = false, length = 50)
    private String role;

    @Column(nullable = false)
    private Boolean ativo;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    public Usuario() {
    }

    public Usuario(
            String nome,
            String usuario,
            String senha,
            String role,
            Boolean ativo
    ) {
        this.nome = nome;
        this.usuario = usuario;
        this.senha = senha;
        this.role = role;
        this.ativo = ativo;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getUsuario() {
        return usuario;
    }

    public String getSenha() {
        return senha;
    }

    public String getRole() {
        return role;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}