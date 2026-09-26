INSERT INTO usuario (
    nome,
    email,
    senha,
    role,
    ativo,
    data_criacao
)
VALUES (
           'Administrador',
           'admin@gestaoalunos.com',
           '$2a$10$hBGaqz45pgM6Lr2JBb9//ejd11gLQiK/ODJ/2Z7g1Ae/2jZxAHuCK',
           'ADMIN',
           TRUE,
           CURRENT_TIMESTAMP
       );