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
- H2 atual é em memória e contém as tabelas `usuario` e `aluno`; os dados são reiniciados ao parar o backend.
- Login JWT e fluxo principal de alunos estão implementados; turmas permanecem fora do escopo obrigatório.

## Discrepâncias e prioridades conhecidas

- Login valida identificador alfanumérico (mínimo 8) e senha (8 a 20 caracteres, letras e números) no frontend e servidor; conta de autenticação não armazena e-mail.
- Protótipo exige senha de 8 a 20 caracteres contendo letras e números; formulário e API aplicam essa regra.
- Login inclui logout local, AuthGuard, interceptor Bearer e autorização ADMIN/LEITOR.
- Módulo de alunos inclui lista, detalhes, cadastro, edição, inativação/reativação e autorização ADMIN na interface e na API. O cadastro retorna à lista com a matrícula; matrículas seguem `AAAA####`; fotos de detalhes são buscadas com Bearer via `HttpClient`. Edição detecta mudanças restauradas e confirma a saída sem salvar.
- O formulário permite upload e remoção de foto, mas ainda não mostra pré-visualização antes do envio.
- Pendências e prioridades atuais estão em [`backlog.md`](backlog.md); a persistência local continua volátil por usar H2 em memória.

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

# Status dos módulos

- Autenticação: login JWT, logout local, guards e autorização ADMIN/LEITOR implementados.
- Gestão de alunos: fluxo principal implementado e pós-login abre a lista; consulte [`backlog.md`](backlog.md) para preview de foto e pendências de qualidade/entrega.
- Gestão de turmas: fora do escopo obrigatório atual.

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

1. Concluir as pendências de qualidade e entrega listadas em [`backlog.md`](backlog.md).
2. Definir e implementar uma opção de banco persistente para além do H2 em memória.
3. Revisar configuração de produção e validar migrations em banco persistente antes do deploy.

Gestão de turmas não faz parte do escopo obrigatório atual.

### Status

🟡 Planejado para pós-MVP

---

# Objetivo do Projeto

Desenvolver um Sistema de Gestão de Alunos utilizando Spring Boot e Angular, aplicando
boas práticas de arquitetura, segurança, versionamento de banco de dados e desenvolvimento
frontend moderno, priorizando simplicidade, organização e manutenção.
