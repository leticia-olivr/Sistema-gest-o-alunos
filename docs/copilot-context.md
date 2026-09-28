### Contexto de desenvolvimento

Este arquivo é o resumo curto para orientar ferramentas e pessoas que trabalham no repositório. A especificação funcional completa fica em [`regras-negocio.md`](regras-negocio.md); a arquitetura implementada em [`arquitetura.md`](arquitetura.md); o estado do schema em [`diagrama-banco.md`](diagrama-banco.md); tarefas em [`backlog.md`](backlog.md); e o fluxo de login em [`autenticacao-login.md`](autenticacao-login.md).

## Fonte de verdade

1. O Protótipo 2.0 define os requisitos funcionais.
2. O código define o comportamento implementado hoje.
3. A documentação deve distinguir claramente requisito, implementação e pendência.

## Projeto

- Monorepo: `backend/`, `frontend/`, `docs/`, `bruno/`.
- Backend: Java 21, Spring Boot 4.1.1, Spring Security, JPA, Flyway, H2, SpringDoc e JJWT.
- Frontend: Angular 21, TypeScript, Angular Material, standalone components e Reactive Forms.
- Estrutura backend em camadas: controller, service, repository, entity, DTO, security/config.
- H2 atual é em memória e contém somente a tabela `usuario`.
- Existe login JWT; CRUD de alunos/turmas ainda não está implementado.

## Discrepâncias e prioridades conhecidas

- Login valida identificador alfanumérico (mínimo 8) e senha (8 a 20 caracteres, letras e números) no frontend e servidor; conta de autenticação não armazena e-mail.
- Protótipo exige senha de 8 a 20 caracteres contendo letras e números; formulário e API aplicam essa regra.
- Login inclui logout local, AuthGuard, interceptor Bearer e autorização ADMIN/LEITOR nos caminhos previstos da API; a lista e os endpoints de alunos ainda não existem.
- Entidade/tabela e endpoints de alunos ainda não existem.

Não implementar turmas, notas, frequência ou recuperação de senha como parte do escopo obrigatório. Antes de dizer que um requisito está concluído, verificar código e testes.

## Documentação

- Começar pelo [`README.md`](../README.md) para executar o projeto.
- Manter requisitos de comportamento em [`regras-negocio.md`](regras-negocio.md).
- Manter implementação/decisões técnicas em [`arquitetura.md`](arquitetura.md).
- Atualizar [`diagrama-banco.md`](diagrama-banco.md) junto com migrations.
- Atualizar [`backlog.md`](backlog.md) ao concluir ou descobrir pendências.

✅ Angular Material

✅ TypeScript

---

# Ferramentas do Projeto

## Desenvolvimento

- IntelliJ IDEA
- VS Code
- Git
- GitHub

## Banco

- H2 Database
- DBeaver

## API

- Swagger UI
- Bruno

---

# URLs de Desenvolvimento

## Backend

Swagger

```text
http://localhost:8080/swagger-ui/index.html
```

OpenAPI JSON

```text
http://localhost:8080/v3/api-docs
```

H2 Console

```text
http://localhost:8080/h2-console
```

## Frontend

```text
http://localhost:4200
```

---

# Próximos Passos

## Fase 2 - Infraestrutura de Banco

1. Configurar Flyway ✅
2. Criar V1__init.sql ✅
3. Criar estrutura inicial do banco ✅

---

## Fase 3 - Segurança

1. Criar entidade Usuario ✅
2. Criar UsuarioRepository ✅
3. Criar AuthController ✅
4. Implementar JWT ✅
5. Implementar Login ✅

---

## Fase 4 - Layout Frontend

1. Header
2. Sidebar
3. Main Layout
4. Dashboard

---

## Fase 5 - Gestão de Alunos

1. Cadastro
2. Consulta
3. Edição
4. Exclusão

---

## Fase 6 - Gestão de Turmas

1. Cadastro
2. Consulta
3. Relacionamentos

---

# Melhorias Futuras

## Banco de Dados Relacional

### Objetivo

Migrar do H2 para PostgreSQL após a conclusão das funcionalidades principais.

### Justificativa

- H2 será utilizado durante o desenvolvimento para simplificar a configuração.
- PostgreSQL será utilizado para aproximar o projeto de um ambiente real de produção.
- A arquitetura com Spring Data JPA e Flyway foi planejada para facilitar essa migração.

### Benefícios

- Experiência prática com banco de dados utilizado no mercado.
- Melhor demonstração técnica para portfólio.
- Maior proximidade com cenários corporativos.
- Validação das migrations Flyway em banco real.
- Melhor preparação para deploy futuro.

## Melhorias Futuras de Segurança

### JWT Secret

O backend injeta `jwt.secret` da variável de ambiente `JWT_SECRET`; não há valor padrão no repositório. Configure uma chave forte (mínimo 256 bits) fora do controle de versão e use valores separados por ambiente. A aplicação não inicia sem uma chave válida.

### Planejamento

1. Concluir autenticação JWT.
2. Concluir módulo de Alunos.
3. Concluir módulo de Turmas.
4. Configurar PostgreSQL.
5. Criar profile de produção.
6. Ajustar application-prod.yml.
7. Executar migrations Flyway.
8. Validar funcionamento completo da aplicação.

### Status

🟡 Planejado para pós-MVP

---

# Objetivo do Projeto

Desenvolver um Sistema de Gestão de Alunos utilizando Spring Boot e Angular, aplicando
boas práticas de arquitetura, segurança, versionamento de banco de dados e desenvolvimento
frontend moderno, priorizando simplicidade, organização e manutenção.
