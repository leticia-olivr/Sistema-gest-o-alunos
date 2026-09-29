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
├── controller/  # AuthController, AlunoController e controller de teste
├── dto/          # Requisições e respostas de autenticação e alunos
├── entity/       # Usuario e Aluno
├── repository/   # UsuarioRepository e AlunoRepository
├── security/     # JwtService e JwtAuthenticationFilter
├── service/      # AuthService e AlunoService
└── util/         # utilitários

frontend/src/app/
├── core/
│   ├── models/   # modelos de autenticação
│   ├── services/ # AuthService e AuthSessionService
│   └── guards/   # guards de autenticação e ADMIN
└── features/
	├── auth/login/ # componente, template e estilos de login
	└── alunos/
	    ├── aluno-list/ # listagem paginada, busca e filtro de status
	    ├── aluno-form/ # formulário standalone de cadastro e edição
	    ├── models/     # modelo de aluno
	    ├── services/   # integração HTTP com a API de alunos
	    └── validators/ # validações de nome, e-mail, CPF, telefone e foto
```

O backend de alunos permite cadastro, consulta paginada, detalhe, edição e inativação. O frontend já possui listagem paginada em `/alunos` e formulário de cadastro/edição; telas de detalhes e ações de edição/inativação a partir da lista ainda estão pendentes. Turmas permanecem fora do escopo obrigatório.

## Fluxo de autenticação atual

```mermaid
sequenceDiagram
	participant UI as Login Angular
	participant Auth as AuthService
	participant API as AuthController
	participant Service as AuthService Java
	participant DB as H2
	participant JWT as JwtService
	UI->>Auth: login(usuario, senha)
	Auth->>API: POST /api/auth/login
	API->>Service: login(LoginRequest)
	Service->>DB: buscar pelo identificador de usuário
	Service->>Service: conferir hash com BCrypt
	Service->>JWT: gerar token
	JWT-->>Service: JWT assinado (expira em 1 hora)
	Service-->>API: LoginResponse(token)
	API-->>Auth: JSON { token }
	Auth->>Auth: salvar em localStorage
	Auth-->>UI: resposta observável
```

O contrato atual envia `usuario` e `senha`. A conta de autenticação não armazena e-mail. O frontend e o backend validam o identificador alfanumérico (mínimo 8 caracteres) e a senha (8 a 20 caracteres, com letras e números).

## API e segurança atuais

- `POST /api/auth/login`: público; valida credenciais e retorna JWT.
- `POST /api/alunos`: multipart; ADMIN; cria aluno e retorna `201` com matrícula gerada.
- `GET /api/alunos`: ADMIN/LEITOR; aceita `busca`, `status` (`ATIVOS`, `INATIVOS`, `TODOS`), `page` e `size` (padrão 0/10); busca nome parcial ou prefixo da matrícula.
- `GET /api/alunos/{id}` e `GET /api/alunos/{id}/foto`: ADMIN/LEITOR; consulta dados e foto.
- `PUT /api/alunos/{id}`: multipart; ADMIN; atualiza nome, e-mail, telefone, status e foto; CPF e matrícula não são editáveis.
- `PATCH /api/alunos/{id}/inativar`: ADMIN; inativa sem apagar o histórico.
- Fotos: JPEG/PNG, no máximo 5 MB; a listagem retorna `fotoUrl` e não carrega os bytes da imagem na página.
- `/swagger-ui/**`, `/v3/api-docs/**` e `/h2-console/**`: públicos no `SecurityConfig` atual.
- Outras rotas: Spring Security exige autenticação.
- `JwtAuthenticationFilter` procura `Authorization: Bearer <token>`.
- Senhas são comparadas com BCrypt. O JWT inclui o identificador de usuário no `subject`, claim `role` e validade de uma hora.
- O JWT fica em `localStorage` sob a chave `siga_auth_token`.

Limitações conhecidas: a área `/inicio` é apenas a entrada protegida, a interface de alunos ainda não existe e CORS não está configurado no backend. Logout, guard, interceptor e matriz de perfis estão implementados. O segredo JWT é configurado pela variável de ambiente `JWT_SECRET`. Detalhes em [`autenticacao-login.md`](autenticacao-login.md).

## Persistência

O `application.properties` usa `jdbc:h2:mem:alunosdb`, portanto o banco é volátil. Flyway cria `usuario` e `aluno` e insere um administrador inicial. O perfil local `dev` é o padrão e carrega 25 alunos de demonstração por um inicializador idempotente; ativar o perfil `prod` desabilita essa carga. Não há tabela de turmas no escopo atual. O modelo está em [`diagrama-banco.md`](diagrama-banco.md).

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
