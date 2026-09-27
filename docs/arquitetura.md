# Arquitetura

## Visão geral

O projeto é um monorepo com frontend Angular e backend Spring Boot. O backend segue organização em camadas; o frontend usa componentes standalone, Angular Router e serviços para acessar a API.

```mermaid
flowchart LR
	Browser[Angular no navegador] -->|HTTP /api| Proxy[Proxy de desenvolvimento Angular]
	Proxy -->|localhost:8080| API[Spring Boot]
	API --> Controller[Controller]
	Controller --> Service[Service]
	Service --> Repository[Repository]
	Repository --> Database[(H2 + Flyway)]
```

O proxy existe apenas no servidor de desenvolvimento. Em produção, configurar proxy reverso no host ou CORS explícito no backend.

## Tecnologias atuais

### Backend

- Java 21 e Spring Boot 4.1.1.
- Spring Web MVC, Spring Security e Spring Data JPA.
- Flyway e H2.
- SpringDoc OpenAPI 3.1.0.
- JJWT 0.12.7.

### Frontend

- Angular 21, TypeScript e Angular Material.
- Standalone Components, Angular Router, Reactive Forms e RxJS.
- `HttpClient` registrado na configuração da aplicação.

## Estrutura implementada

```text
backend/src/main/java/com/leticia/gestaoalunos/
├── config/       # Spring Security e configuração
├── controller/  # AuthController e controller de teste
├── dto/          # LoginRequest e LoginResponse
├── entity/       # Usuario
├── repository/   # UsuarioRepository
├── security/     # JwtService e JwtAuthenticationFilter
├── service/      # AuthService
└── util/         # utilitários

frontend/src/app/
├── core/
│   ├── models/   # modelos de autenticação
│   └── services/ # AuthService
└── features/
	└── auth/login/ # componente, template e estilos de login
```

As pastas de alunos, turmas, layout e guards estão previstas na arquitetura, mas ainda não contêm funcionalidades de negócio implementadas.

## Fluxo de autenticação atual

```mermaid
sequenceDiagram
	participant UI as Login Angular
	participant Auth as AuthService
	participant API as AuthController
	participant Service as AuthService Java
	participant DB as H2
	participant JWT as JwtService
	UI->>Auth: login(email, senha)
	Auth->>API: POST /api/auth/login
	API->>Service: login(LoginRequest)
	Service->>DB: buscar usuário por e-mail
	Service->>Service: conferir hash com BCrypt
	Service->>JWT: gerar token
	JWT-->>Service: JWT assinado (expira em 1 hora)
	Service-->>API: LoginResponse(token)
	API-->>Auth: JSON { token }
	Auth->>Auth: salvar em localStorage
	Auth-->>UI: resposta observável
```

O contrato atual envia `email` e `senha`; o protótipo oficial descreve `usuario` e `senha`. Essa diferença precisa ser resolvida conforme [`regras-negocio.md`](regras-negocio.md), antes de declarar o login conforme ao desafio.

## API e segurança atuais

- `POST /api/auth/login`: público; valida credenciais e retorna JWT.
- `/swagger-ui/**`, `/v3/api-docs/**` e `/h2-console/**`: públicos no `SecurityConfig` atual.
- Outras rotas: Spring Security exige autenticação.
- `JwtAuthenticationFilter` procura `Authorization: Bearer <token>`.
- Senhas são comparadas com BCrypt. O JWT inclui e-mail no `subject`, claim `role` e validade de uma hora.
- O JWT fica em `localStorage` sob a chave `siga_auth_token`.

Limitações conhecidas: segredo JWT fixo no código; não há interceptor Angular, AuthGuard, logout ou autorização efetiva por role; usuário inativo não é recusado no login; exceções do login não têm mapeamento HTTP centralizado; CORS não está configurado no backend. Detalhes em [`autenticacao-login.md`](autenticacao-login.md).

## Persistência

O `application.properties` usa `jdbc:h2:mem:alunosdb`, portanto o banco é volátil. Flyway cria atualmente apenas `usuario` e insere um administrador inicial. Não existe ainda entidade ou tabela de alunos/turmas. O estado atual e o modelo futuro esperado estão separados em [`diagrama-banco.md`](diagrama-banco.md).

## Comandos principais

```powershell
# Backend
cd backend
.\mvnw.cmd spring-boot:run
.\mvnw.cmd test

# Frontend (em outro terminal)
cd frontend
npm install
npm start
npm run build
```

O frontend usa `src/proxy.conf.json` durante `ng serve`, com destino `http://localhost:8080`.
