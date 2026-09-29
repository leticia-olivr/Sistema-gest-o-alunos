CREATE TABLE aluno (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    matricula VARCHAR(20) NOT NULL,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    telefone VARCHAR(11) NOT NULL,
    foto BLOB,
    foto_mime_type VARCHAR(50),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_aluno_matricula UNIQUE (matricula),
    CONSTRAINT uk_aluno_email UNIQUE (email),
    CONSTRAINT uk_aluno_cpf UNIQUE (cpf),
    CONSTRAINT ck_aluno_foto_mime CHECK (
        (foto IS NULL AND foto_mime_type IS NULL)
        OR (foto IS NOT NULL AND foto_mime_type IS NOT NULL)
    )
);