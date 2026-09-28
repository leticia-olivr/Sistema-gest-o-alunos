# Sistema de Gestão de Alunos

Monorepo de um sistema para consulta e manutenção de cadastro de alunos. O **Protótipo 2.0** é a fonte oficial dos requisitos; várias funcionalidades do desafio ainda estão pendentes de implementação.

## Estado atual

- Backend Spring Boot com autenticação JWT, usuário inicial via Flyway, H2 e Swagger.
- Frontend Angular standalone com login por usuário, proteção de rota, logout local e interceptor Bearer.
- Backend valida as credenciais, emite JWT, responde `401` para sessão inválida e aplica regras de perfil nos caminhos previstos da API.
- A área de alunos e seus endpoints ainda não foram implementados; acompanhe o progresso em [`docs/backlog.md`](docs/backlog.md).

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

O Angular inicia por padrão em `http://localhost:4200`. O proxy de desenvolvimento encaminha chamadas `/api` para `http://localhost:8080`; por isso, inicie o backend antes de testar o login.

## Endereços locais

- Frontend: `http://localhost:4200/login`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- H2 Console: `http://localhost:8080/h2-console`
- JDBC URL local: `jdbc:h2:mem:alunosdb`

O H2 está configurado em memória; os dados são reinicializados quando o backend reinicia. O usuário inicial é inserido por Flyway. Não há senha padrão documentada neste arquivo; consulte a configuração local apropriada.

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
