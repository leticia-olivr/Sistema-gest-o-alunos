CREATE TABLE usuario (
                         id BIGINT PRIMARY KEY AUTO_INCREMENT,

                         nome VARCHAR(150) NOT NULL,

                         email VARCHAR(150) NOT NULL UNIQUE,

                         senha VARCHAR(255) NOT NULL,

                         role VARCHAR(50) NOT NULL,

                         ativo BOOLEAN NOT NULL DEFAULT TRUE,

                         data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);