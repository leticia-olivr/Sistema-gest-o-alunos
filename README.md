# Sistema de Gestão de Alunos

Monorepo de um sistema para consulta e manutenção de cadastro de alunos. O **Protótipo 2.0** é a fonte oficial dos requisitos. O fluxo principal está implementado; consulte [`docs/backlog.md`](docs/backlog.md) para as pendências de qualidade e entrega.

## Estado atual

- Backend Spring Boot com autenticação JWT, usuário inicial via Flyway, H2 e Swagger.
- Frontend Angular standalone com login por usuário, proteção de rota, logout local e interceptor Bearer.
- O perfil local `dev` (padrão) carrega 25 alunos de demonstração; configure `SPRING_PROFILES_ACTIVE=prod` para não executar essa carga.
- Backend valida as credenciais, emite JWT, responde `401` para sessão inválida e aplica regras de perfil nos caminhos previstos da API.
- Após o login, a aplicação abre diretamente a lista de alunos. O fluxo inclui listagem paginada, busca/filtros, detalhes, cadastro e edição; cadastro bem-sucedido retorna à lista com a matrícula criada.
- Matrículas têm 8 dígitos numéricos no formato `AAAA####` (ano e sequência anual). Escrita, incluindo inativação/reativação, exige perfil Administrador.
- O formulário protege contra saída com alterações não salvas. Fotos JPEG/PNG de até 5 MB são armazenadas no banco e carregadas na tela de detalhes com autenticação.
- Conta inicial local: usuário `admin1234`, senha `Senha123`. Credencial somente para desenvolvimento; troque-a antes de usar qualquer ambiente compartilhado ou produção.

## Requisitos

- Java 21.
- Node.js em versão LTS compatível com Angular 21 e npm.
- Windows: os comandos Maven abaixo usam o wrapper `mvnw.cmd`.

## Executar localmente

Inicie o backend em um terminal PowerShell:

```powershell
# Configure JWT_SECRET antes; consulte a seção de segredo JWT em docs/autenticacao-login.md.
cd backend
.\mvnw.cmd spring-boot:run
```

Inicie o frontend em outro terminal:

```powershell
cd frontend
npm install
npm start
```

O Angular inicia por padrão em `http://localhost:4200/login`. Após autenticar, abre a lista em `/alunos`. O proxy de desenvolvimento encaminha chamadas `/api` para `http://localhost:8080`; inicie o backend antes de testar a aplicação.

## Endereços locais

- Frontend: `http://localhost:4200/login`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- H2 Console: `http://localhost:8080/h2-console`
- JDBC URL local: `jdbc:h2:mem:alunosdb`

O H2 está configurado em memória; os dados são reinicializados quando o backend reinicia. A conta inicial é inserida e atualizada pelas migrations Flyway.

## Testes e build

Backend:

```powershell
cd backend
.\mvnw.cmd test
```

Frontend:

```powershell
cd frontend
npm test
npm run build
```

Consulte [`docs/README.md`](docs/README.md) para o índice da documentação, setup detalhado e estado conhecido do projeto.
