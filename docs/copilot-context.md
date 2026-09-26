# Sistema de Gestão de Alunos

## Status Atual

✅ Repositório criado

✅ Backend criado

✅ Frontend criado

✅ Angular Material instalado

✅ Swagger funcionando

✅ H2 funcionando

✅ Spring Security configurado

✅ Git configurado

✅ Estrutura inicial concluída

---

# Arquitetura

Monorepo

```text
sistema-gestao-alunos/
│
├── backend/
├── frontend/
├── docs/
├── bruno/
├── README.md
└── .gitignore
```

---

# Backend

## Tecnologias

- Java 21
- Spring Boot 4.1.1
- Maven
- Spring Security
- Spring Data JPA
- Flyway
- H2
- Swagger/OpenAPI

## Estrutura

```text
com.leticia.gestaoalunos
│
├── config
├── controller
├── dto
│   ├── request
│   └── response
├── entity
├── exception
├── mapper
├── repository
├── security
├── service
└── util
```

---

# Frontend

## Tecnologias

- Angular
- Angular Material
- TypeScript

## Estrutura

```text
app
│
├── core
│   ├── guards
│   ├── interceptors
│   ├── models
│   └── services
│
├── shared
│   ├── components
│   ├── directives
│   ├── interfaces
│   └── pipes
│
├── layout
│   ├── header
│   ├── footer
│   ├── sidebar
│   └── main-layout
│
└── features
    ├── auth
    ├── dashboard
    ├── alunos
    └── turmas
```

---

# Regras de Arquitetura

## Utilizar

✅ Arquitetura em Camadas (Layered Architecture)

✅ DTO

✅ Mapper

✅ Spring Data JPA

✅ Flyway

✅ JWT

✅ Angular Standalone

✅ Angular Material

✅ Monorepo

---

# Não Utilizar

❌ Microservices

❌ DDD Complexo

❌ CQRS

❌ Event Sourcing

❌ Hexagonal Complexa

❌ Clean Architecture Completa

---

# Convenções

## Controllers

``java
AlunoController 
        UsuarioController
AuthController
``

## Services

``java
AlunoService
        UsuarioService
AuthService
``

## Repositories

``java
AlunoRepository 
        UsuarioRepository
``

## DTOs

``java
AlunoRequest
        AlunoResponse

UsuarioRequest
        UsuarioResponse

LoginRequest
        LoginResponse;
``

## Endpoints

```text
/api/auth
/api/alunos
/api/turmas
```

Sempre utilizar substantivos no plural.

---

# Convenções de Banco

## Tabelas

```text
usuario
aluno
turma
```

Sempre em minúsculo.

## Colunas

```text
nome_completo
data_nascimento
data_criacao
```

Sempre em snake_case.

---

# Estrutura Git

Branch principal:

```text
main
```

Estratégia adotada:

- Projeto individual
- Sem branches de feature inicialmente
- Desenvolvimento direto na branch main
- Commits pequenos e frequentes

---

# Dependências Atuais

## Backend

✅ Spring Web

✅ Spring Security

✅ Spring Data JPA

✅ Flyway

✅ H2 Database

✅ SpringDoc OpenAPI (Swagger)

## Frontend

✅ Angular

✅ Angular Router

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

Situação atual:

A chave JWT está definida diretamente no código para simplificar o desenvolvimento inicial.

Melhoria planejada:

- Remover a chave do código-fonte.
- Armazenar a chave em variáveis de ambiente.
- Utilizar uma chave criptograficamente forte.
- Utilizar configurações separadas por ambiente.

Exemplo futuro:

jwt.secret=${JWT_SECRET}

Motivação:

- Evitar exposição da chave no GitHub.
- Facilitar a troca de credenciais entre ambientes.
- Aumentar a segurança da autenticação JWT.

Status:

🟡 Planejado para pós-MVP

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