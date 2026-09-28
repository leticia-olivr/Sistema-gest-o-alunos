ALTER TABLE usuario ADD COLUMN usuario VARCHAR(50);

UPDATE usuario
SET usuario = 'user' || LPAD(CAST(id AS VARCHAR), 8, '0');

UPDATE usuario
SET usuario = 'admin1234'
WHERE email = 'admin@gestaoalunos.com';

ALTER TABLE usuario ALTER COLUMN usuario SET NOT NULL;

ALTER TABLE usuario
    ADD CONSTRAINT uk_usuario_usuario UNIQUE (usuario);