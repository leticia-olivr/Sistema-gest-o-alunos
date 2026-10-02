# Backlog

Este backlog acompanha as diferenças entre o código existente e o Protótipo 2.0. Os itens abaixo não estão implementados só por aparecerem aqui. Prioridade P0 fecha a autenticação exigida; P1 entrega o fluxo principal de alunos; P2 cobre robustez e qualidade.

## P0 - Concluir autenticação

### Concluído no código atual

- [x] Implementar `POST /api/auth/login` com busca do usuário pelo identificador, comparação de senha usando BCrypt e resposta contendo JWT.
- [x] Gerar JWT assinado com `subject`, claim `role` e expiração de uma hora.
- [x] Integrar o formulário Angular standalone/Reactive Forms ao endpoint de login.
- [x] Guardar o token retornado no `localStorage` com a chave `siga_auth_token` e disponibilizar leitura pelo `AuthService`.
- [x] Validar os campos do login no frontend e bloquear envio com formulário inválido.
- [x] Durante o envio, indicar processamento e impedir cliques duplicados.
- [x] Exibir mensagem genérica no frontend para respostas HTTP `401`/`403` e mensagem de falha de conexão para status `0`.
- [x] Configurar o Spring Security para permitir `/api/auth/**` e exigir autenticação nas demais rotas; incluir o filtro JWT na cadeia de segurança.
- [x] Validar manualmente o login integrado: credencial inválida chega ao backend via proxy e a interface exibe mensagem genérica; resposta simulada de sucesso salva o token.

Esses itens descrevem o que existe hoje. Eles não significam conformidade completa com os requisitos RN-001 a RN-008, listados em [`regras-negocio.md`](regras-negocio.md#1-login-rn-001-a-rn-008).

### Ainda pendente

- [x] Definir o identificador de login conforme o protótipo: usuário alfanumérico com pelo menos 8 caracteres. Atualizar modelo, migration/seed e API; remover e-mail da conta de autenticação.
- [x] Validar senha de 8 a 20 caracteres com letras e números no frontend e no backend.
- [x] Implementar validação server-side (`@Valid` e constraints) para o identificador e a senha.
- [x] Padronizar exceções de autenticação com mensagem genérica e status HTTP estável `401`; o frontend já apresenta mensagem genérica para `401`/`403`.
- [x] Tratar JWT malformado/expirado como não autenticado (`401`) sem erro inesperado.
- [x] Externalizar o segredo JWT em configuração segura; não versionar segredo real.
- [x] Implementar logout removendo `siga_auth_token` do `localStorage` e retornar à tela de login.
- [x] Criar `AuthGuard` para rotas privadas: sem token válido, redirecionar para `/login`.
- [x] Criar interceptor HTTP para enviar `Authorization: Bearer <token>` nas chamadas protegidas e tratar `401`/sessão expirada.
- [x] Mapear a claim `role` para autoridades Spring e aplicar autorização por Administrador/Leitor na API (`GET /api/alunos/**` para ambos; demais métodos apenas para Administrador).
- [x] Alinhar o texto do botão ao protótipo (**Acessar**) ou registrar formalmente a decisão de manter **Entrar**.
- [x] Criar testes automatizados específicos para o serviço e endpoint de autenticação, filtro JWT e mensagens de erro.
- [x] Criar testes para guard e interceptor quando esses recursos forem implementados.

## P1 - Entregar cadastro e consulta de alunos

- [x] Definir entidade e migration `aluno`, conforme [`diagrama-banco.md`](diagrama-banco.md).
- [x] Implementar DTOs, repositório, serviço e endpoints para criar, listar, consultar, editar, inativar e reativar alunos.
- [x] Implementar matrícula gerada no backend e constraints/unicidade para matrícula, CPF e e-mail.
- [x] Implementar validações de nome, e-mail, CPF, telefone e foto no frontend e no servidor.
- [x] Criar massa inicial com pelo menos 25 alunos no perfil `dev`.
- [x] Criar listagem com 10 itens por página, ordenação por nome, busca parcial de nome, prefixo de matrícula e filtros de status.
- [x] Preservar busca/filtro/ordenação/página ao navegar para detalhes/edição e voltar.
- [x] Implementar estados de carregamento, vazio, erro, sucesso e nova tentativa.
- [x] Criar detalhes somente leitura com alternativa de foto acessível.
- [x] Após cadastro bem-sucedido, retornar à lista e informar a matrícula criada (RN-024).
- [x] Criar edição com campos imutáveis matrícula/CPF, detecção de dirty state e confirmação ao sair sem salvar.
- [x] Implementar inativação e reativação na interface, somente para Administrador, com confirmação acessível e correção da página após a operação.
- [x] Restringir ações administrativas na interface e, principalmente, na API.
- [ ] Exibir pré-visualização da foto selecionada antes do envio (RN-022).

## P2 - Qualidade, segurança e entrega

- [ ] Configurar banco persistente para que os dados sobrevivam ao reinício; H2 `mem` é somente para desenvolvimento/demonstração.
- [x] Criar testes unitários frontend para os validadores de nome, e-mail, CPF, telefone e foto.
- [ ] Criar testes unitários backend para as regras de negócio e validações do serviço de alunos.
- [x] Criar testes de integração para endpoints, autenticação e permissões.
- [ ] Criar um fluxo automatizado crítico frontend/backend.
- [ ] Testar evidências para Administrador e Leitor, inclusive tentativa de acesso direto à API.
- [ ] Definir CORS ou proxy reverso por ambiente; o proxy atual é somente para `ng serve`.
- [ ] Revisar logging, mensagens de erro, acessibilidade e responsividade.
- [x] Atualizar README, documentação de arquitetura/autenticação e diagrama do banco para refletir os endpoints e formato atual da matrícula.
- [ ] Completar descrições de operações e respostas na documentação OpenAPI gerada.

## Decisões necessárias

- A conta inicial é migrada por V3 a V5; V5 define uma senha de desenvolvimento compatível com as regras de login.
- [x] Armazenar fotos no BLOB do banco, aceitar JPEG/PNG e limitar a 5 MB; reavaliar armazenamento externo se a escala aumentar.
- Definir se JWT continuará sendo a sessão ou se será adotado cookie seguro; qualquer alternativa deve abranger backend e frontend.
