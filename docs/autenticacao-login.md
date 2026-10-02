# Login e Autenticação

Este documento descreve o fluxo de login implementado no frontend Angular e sua integração com o endpoint JWT do backend.

Os requisitos oficiais de login e a comparação requisito/implementação estão em [`regras-negocio.md`](regras-negocio.md#1-login-rn-001-a-rn-008). O identificador e as regras de senha do protótipo são validados no frontend e no servidor.

## Arquivos envolvidos

```text
frontend/src/app/
├── core/
│   ├── guards/auth.guard.ts
│   ├── interceptors/auth.interceptor.ts
│   ├── models/auth.model.ts
│   └── services/
│       ├── auth.service.ts
│       └── auth-session.service.ts
├── features/auth/login/
│   ├── login.ts
│   ├── login.html
│   └── login.css
├── features/dashboard/
└── layout/main-layout/
├── app.config.ts
└── app.routes.ts

frontend/src/proxy.conf.json
```

| Arquivo                          | Responsabilidade                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `features/auth/login/login.ts`   | Define o componente, o formulário reativo, valida os dados e trata sucesso e erro. |
| `features/auth/login/login.html` | Exibe título, campos de usuário e senha, mensagens e botão de envio.               |
| `features/auth/login/login.css`  | Centraliza o formulário e define estilos básicos.                                  |
| `core/models/auth.model.ts`      | Tipagem do pedido e da resposta de login.                                          |
| `core/services/auth.service.ts`  | Envia a requisição HTTP e delega o armazenamento da sessão.                         |
| `core/services/auth-session.service.ts` | Persiste/remove o token e verifica sua expiração local.                      |
| `core/guards/auth.guard.ts`      | Protege a área autenticada e retorna ao login sem sessão válida.                    |
| `core/interceptors/auth.interceptor.ts` | Envia o Bearer e encerra a sessão local após `401` protegido.              |
| `layout/main-layout/`            | Exibe o botão de logout na área autenticada e hospeda suas rotas.                   |
| `app.config.ts`                  | Registra os providers da aplicação, incluindo `HttpClient`.                        |
| `app.routes.ts`                  | Carrega a página de login em `/login` e redireciona a rota inicial para ela.       |
| `src/proxy.conf.json`            | Encaminha `/api` para o backend local durante o desenvolvimento Angular.           |

## Formulário reativo

O componente cria o formulário usando `FormBuilder`:

```ts
this.formBuilder.nonNullable.group({
  usuario: ["", [Validators.required, Validators.minLength(8), Validators.pattern(/^[a-zA-Z0-9]+$/)]],
  senha: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.*[A-Za-z])(?=.*[0-9]).+$/)]],
});
```

O formulário possui dois controles:

- `usuario`: obrigatório, com pelo menos 8 caracteres e somente letras e números.
- `senha`: obrigatória, entre 8 e 20 caracteres, com pelo menos uma letra e um número.

No template, `[formGroup]` conecta o formulário à página e `formControlName` conecta cada campo ao respectivo controle. Isso permite consultar o estado do formulário, como `form.invalid`, e exibir erros de validação.

## Envio do login

1. A pessoa preenche usuário e senha e pressiona **Acessar**.
2. O evento `(ngSubmit)` chama o método `submit()` do componente.
3. O componente impede o envio se o formulário for inválido ou se já houver uma requisição em andamento.
4. O componente chama `AuthService.login()` com os valores do formulário.
5. O serviço envia uma requisição `POST` para `/api/auth/login`.
6. Em caso de sucesso, o serviço salva o JWT e o componente navega para a rota protegida de retorno ou para `/inicio`. Em caso de erro, o componente mostra uma mensagem adequada.

O corpo enviado ao backend segue os nomes definidos pelo DTO Java `LoginRequest`:

```json
{
  "usuario": "admin1234",
  "senha": "sua-senha"
}
```

Para execução local com o seed Flyway, use `admin1234` e a senha de desenvolvimento `Senha123`. Essa credencial é pública no projeto e não deve ser usada em produção.

O backend responde com o token:

```json
{
  "token": "<jwt retornado pelo backend>"
}
```

## Armazenamento do JWT

O `AuthService` usa o operador RxJS `tap` para salvar a resposta na sessão local quando o login termina com sucesso:

```ts
.pipe(tap(({ token }) => this.session.saveToken(token)));
```

A chave usada no navegador é `siga_auth_token`, gerenciada pelo `AuthSessionService`. O guard verifica o campo `exp` para não manter uma sessão local expirada; a assinatura continua sendo validada pelo backend.

O token só é armazenado após uma resposta de sucesso. O comando **Sair** remove essa chave e retorna a `/login`; isso encerra a sessão local, sem revogar cópias do JWT já emitido no servidor.

## Tratamento de erros

- HTTP `401`: usuário inexistente e senha incorreta retornam o mesmo corpo genérico; a interface informa que usuário ou senha estão incorretos.
- HTTP `400`: o servidor rejeita os campos que não atendem às regras de validação.
- HTTP `403`: a interface também apresenta mensagem genérica de credenciais.
- Status `0`: informa que não foi possível conectar ao servidor, por exemplo, se o backend estiver parado.
- Outros erros: exibe uma mensagem genérica.

## Proxy local

O backend não habilita CORS para chamadas diretas do navegador. Durante o desenvolvimento, o proxy do Angular redireciona requisições com prefixo `/api` para `http://localhost:8080`. Assim, o frontend chama uma URL relativa e não precisa incluir o endereço do backend no código do serviço.

O proxy é configurado em `frontend/src/proxy.conf.json` e referenciado pela configuração `serve` do Angular em `frontend/angular.json`. Ele é destinado ao servidor de desenvolvimento; a configuração de proxy para produção depende do servidor que hospedar a aplicação.

## Segredo JWT por ambiente

O backend lê `jwt.secret` da variável de ambiente `JWT_SECRET`. Não há segredo padrão: a aplicação falha ao iniciar se a variável estiver ausente ou se a chave tiver menos de 256 bits. Em produção, injete a variável por um gerenciador de segredos; não grave o valor no repositório nem em arquivos de configuração versionados.

Para gerar uma chave local temporária no PowerShell e iniciar o backend na mesma sessão:

```powershell
$bytes = New-Object byte[] 32
$generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$generator.GetBytes($bytes)
$generator.Dispose()
$env:JWT_SECRET = [Convert]::ToBase64String($bytes)
Push-Location backend
.\mvnw.cmd spring-boot:run
Pop-Location
```

Uma nova chave invalida os JWTs assinados pela chave anterior; será necessário entrar novamente após a troca.

## Limites desta etapa

- O login navega para `/inicio`, uma área protegida mínima com logout; a aplicação também oferece o fluxo de gestão de alunos descrito em [`arquitetura.md`](arquitetura.md).
- O interceptor trata `401` de APIs protegidas como sessão expirada; um `401` do próprio endpoint de login continua sendo exibido como credencial inválida.
- O token fica no `localStorage`, que pode ser acessado por JavaScript executado na mesma origem. Para aplicações com exigência de segurança maior, avalie uma estratégia de sessão com cookie `HttpOnly`, `Secure` e `SameSite`, em conjunto com o backend.

## Backend

O backend recebe as credenciais, compara a senha informada com o hash BCrypt salvo e, se forem válidas, devolve um JWT assinado.

### Arquivos do backend

```text
backend/src/main/java/com/leticia/gestaoalunos/
├── config/SecurityConfig.java
├── controller/AuthController.java
├── dto/
│   ├── request/LoginRequest.java
│   └── response/LoginResponse.java
├── entity/Usuario.java
├── repository/UsuarioRepository.java
├── security/
│   ├── JwtAuthenticationFilter.java
│   └── JwtService.java
└── service/AuthService.java
```

| Arquivo                                 | Responsabilidade                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `controller/AuthController.java`        | Expõe `POST /api/auth/login` e encaminha o pedido ao serviço.                                       |
| `dto/request/LoginRequest.java`         | Recebe `usuario` e `senha` enviados pelo cliente.                                                   |
| `dto/response/LoginResponse.java`       | Devolve o token no campo `token`.                                                                   |
| `service/AuthService.java`              | Busca o usuário, verifica a senha BCrypt e solicita a geração do token.                             |
| `repository/UsuarioRepository.java`     | Busca o usuário pelo identificador com `findByUsuario`.                                            |
| `entity/Usuario.java`                   | Representa os dados persistidos do usuário, incluindo identificador, hash da senha, perfil e status ativo. |
| `security/JwtService.java`              | Gera e valida tokens JWT e extrai o identificador do subject.                                       |
| `security/JwtAuthenticationFilter.java` | Valida o token e converte o perfil em autoridade Spring Security.                                   |
| `config/SecurityConfig.java`            | Configura rotas públicas, `401`, leitura para ADMIN/LEITOR e escrita restrita a ADMIN.              |

### Fluxo do endpoint

1. `AuthController` recebe o JSON e o converte em `LoginRequest`.
2. `AuthService` chama `UsuarioRepository.findByUsuario()`.
3. Se encontrar o usuário, compara a senha enviada com o hash salvo usando `PasswordEncoder.matches()`.
4. Se a comparação passar, chama `JwtService.generateToken(usuario)`.
5. O controller devolve `LoginResponse`, serializado como JSON com o campo `token`.

O DTO de pedido usa as propriedades `usuario` e `senha`. A senha recebida é comparada com o hash BCrypt armazenado; o backend não deve armazenar a senha em texto puro. A conta de autenticação não armazena e-mail.

O controller aplica `@Valid` ao DTO. O servidor rejeita o pedido com HTTP `400` se usuário ou senha não atenderem às constraints; a validação ocorre antes da busca da conta e da comparação BCrypt.

### Conteúdo e duração do JWT

O `JwtService` monta um token com:

- `subject`: identificador de usuário;
- claim `role`: perfil atual do usuário;
- `issuedAt`: instante de emissão;
- `expiration`: uma hora após a emissão;
- assinatura HMAC usando uma chave secreta.

O JWT é assinado, não criptografado: seu payload pode ser decodificado por quem possuir o token. Não coloque senhas ou outros segredos nas claims.

### Autenticação de requisições protegidas

O `JwtAuthenticationFilter` é executado antes do filtro padrão de usuário e senha do Spring Security. Ele procura o cabeçalho:

```http
Authorization: Bearer <jwt>
```

Quando encontra um token, extrai o identificador, busca o usuário, valida a assinatura, o identificador e a expiração e registra a autenticação em `SecurityContextHolder`. Tokens emitidos antes da troca do `subject` de e-mail para identificador não autenticam mais; é necessário entrar novamente. Se o token estiver malformado ou expirado, o filtro limpa o contexto e continua sem autenticação; uma rota protegida responde `401`.

### Regras de acesso

Em `SecurityConfig`, as rotas `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**` e `/h2-console/**` são públicas. `GET /api/alunos/**` aceita `ROLE_ADMIN` e `ROLE_LEITOR`; os demais métodos nesse prefixo e `/api/admin/**` exigem `ROLE_ADMIN`. Outras rotas de API aceitam somente os dois perfis conhecidos. O endpoint de login, portanto, pode ser chamado sem JWT.

O filtro confere se a claim `role` assinada corresponde ao perfil atual persistido e registra `ROLE_ADMIN` ou `ROLE_LEITOR` no contexto. A API permite leitura de alunos para ADMIN/LEITOR e exige ADMIN para operações de escrita, incluindo inativação e reativação.

### Tratamento de erros e itens a revisar

- A exceção `InvalidCredentialsException` é mapeada por `GlobalExceptionHandler` para HTTP `401` e a mesma mensagem genérica nos casos de usuário inexistente ou senha incorreta.
- A propriedade `ativo` existe na entidade, mas o fluxo atual de login não verifica se o usuário está ativo.
- A chave JWT é injetada pela variável `JWT_SECRET`; mantenha-a protegida e use valores diferentes por ambiente.
- A configuração atual não define CORS. O proxy do Angular resolve isso no desenvolvimento local; em produção, o servidor precisa configurar o proxy ou o backend precisa permitir explicitamente a origem do frontend.
