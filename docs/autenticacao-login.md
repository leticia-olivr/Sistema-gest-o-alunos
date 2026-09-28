# Login e Autenticação

Este documento descreve o fluxo de login implementado no frontend Angular e sua integração com o endpoint JWT do backend.

Os requisitos oficiais de login e a comparação requisito/implementação estão em [`regras-negocio.md`](regras-negocio.md#1-login-rn-001-a-rn-008). O identificador e as regras de senha do protótipo são validados no frontend e no servidor.

## Arquivos envolvidos

```text
frontend/src/app/
├── core/
│   ├── models/auth.model.ts
│   └── services/auth.service.ts
├── features/auth/login/
│   ├── login.ts
│   ├── login.html
│   └── login.css
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
| `core/services/auth.service.ts`  | Envia a requisição HTTP e persiste o token recebido.                               |
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
6. Em caso de sucesso, o serviço salva o JWT e o componente exibe uma mensagem de confirmação. Em caso de erro, o componente mostra uma mensagem adequada.

O corpo enviado ao backend segue os nomes definidos pelo DTO Java `LoginRequest`:

```json
{
  "usuario": "admin1234",
  "senha": "sua-senha"
}
```

O backend responde com o token:

```json
{
  "token": "<jwt retornado pelo backend>"
}
```

## Armazenamento do JWT

O `AuthService` usa o operador RxJS `tap` para executar uma ação quando a resposta chega com sucesso:

```ts
.pipe(tap(({ token }) => localStorage.setItem(this.tokenStorageKey, token)));
```

A chave usada no navegador é `siga_auth_token`. O método `getToken()` do serviço lê o valor novamente do `localStorage`.

O token só é armazenado após uma resposta de sucesso. A implementação atual não remove o token por logout e ainda não o adiciona automaticamente a chamadas protegidas; interceptor e logout são etapas futuras.

## Tratamento de erros

- HTTP `401` ou `403`: informa genericamente que o usuário ou a senha estão incorretos.
- Status `0`: informa que não foi possível conectar ao servidor, por exemplo, se o backend estiver parado.
- Outros erros: exibe uma mensagem genérica.

## Proxy local

O backend não habilita CORS para chamadas diretas do navegador. Durante o desenvolvimento, o proxy do Angular redireciona requisições com prefixo `/api` para `http://localhost:8080`. Assim, o frontend chama uma URL relativa e não precisa incluir o endereço do backend no código do serviço.

O proxy é configurado em `frontend/src/proxy.conf.json` e referenciado pela configuração `serve` do Angular em `frontend/angular.json`. Ele é destinado ao servidor de desenvolvimento; a configuração de proxy para produção depende do servidor que hospedar a aplicação.

## Limites desta etapa

- Não há `AuthGuard` protegendo rotas.
- Não há interceptor enviando o JWT no cabeçalho `Authorization`.
- Após o login, a tela mostra uma confirmação, mas ainda não redireciona para um dashboard.
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
| `security/JwtAuthenticationFilter.java` | Lê o token Bearer em requisições e estabelece a autenticação no contexto Spring Security.           |
| `config/SecurityConfig.java`            | Configura BCrypt, rotas públicas/protegidas e posição do filtro JWT na cadeia de segurança.         |

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

Quando encontra um token, extrai o identificador, busca o usuário, valida a assinatura, o identificador e a expiração e registra a autenticação em `SecurityContextHolder`. Tokens emitidos antes desta alteração tinham o e-mail no `subject` e não autenticam mais; é necessário entrar novamente. Sem um token válido, o filtro continua a cadeia sem estabelecer uma autenticação; a decisão de permitir ou negar a rota cabe às regras do Spring Security.

### Regras de acesso

Em `SecurityConfig`, as rotas `/api/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**` e `/h2-console/**` são públicas. As demais rotas exigem que a requisição esteja autenticada. O endpoint de login, portanto, pode ser chamado sem JWT.

O filtro não adiciona autoridades ao objeto de autenticação (`authorities` é `null`). Embora o token contenha a claim `role`, ainda não há autorização por perfil/role implementada.

### Tratamento de erros e itens a revisar

- O serviço lança `RuntimeException` para usuário não encontrado ou senha inválida. Não há `@ControllerAdvice` ou mapeamento explícito dessas exceções para um formato/status HTTP estável; esse contrato deve ser padronizado antes de depender de códigos específicos no cliente.
- A propriedade `ativo` existe na entidade, mas o fluxo atual de login não verifica se o usuário está ativo.
- A chave JWT está definida como constante no código. Antes de produção, mova-a para configuração externa protegida, use uma chave forte e rotacione a chave atual.
- O filtro não captura explicitamente exceções de token malformado ou assinatura inválida. Convém convertê-las em uma resposta de autenticação não autorizada, sem interromper a requisição com erro inesperado.
- O endpoint ainda não aplica validação Bean Validation (`@Valid`) ao DTO de entrada.
- A configuração atual não define CORS. O proxy do Angular resolve isso no desenvolvimento local; em produção, o servidor precisa configurar o proxy ou o backend precisa permitir explicitamente a origem do frontend.
