package com.leticia.gestaoalunos.repository;

import com.leticia.gestaoalunos.entity.Aluno;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface AlunoRepository extends JpaRepository<Aluno, Long> {

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByCpf(String cpf);

        boolean existsByMatricula(String matricula);

    @Query("""
            SELECT aluno.id AS id,
                   aluno.matricula AS matricula,
                   aluno.nome AS nome,
                   aluno.email AS email,
                   aluno.cpf AS cpf,
                   aluno.telefone AS telefone,
                   aluno.ativo AS ativo,
                   aluno.dataCriacao AS dataCriacao,
                   aluno.fotoMimeType AS fotoMimeType
            FROM Aluno aluno
            WHERE (:ativo IS NULL OR aluno.ativo = :ativo)
              AND (:busca IS NULL
                   OR LOWER(aluno.nome) LIKE LOWER(CONCAT('%', :busca, '%'))
                   OR UPPER(aluno.matricula) LIKE UPPER(CONCAT(:busca, '%')))
            """)
        Page<AlunoResumo> buscar(
            @Param("busca") String busca,
            @Param("ativo") Boolean ativo,
            Pageable pageable
    );

        interface AlunoResumo {
                Long getId();

                String getMatricula();

                String getNome();

                String getEmail();

                String getCpf();

                String getTelefone();

                Boolean getAtivo();

                LocalDateTime getDataCriacao();

                String getFotoMimeType();
        }
}