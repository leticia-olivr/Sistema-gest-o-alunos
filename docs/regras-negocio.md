# Regras de Negócio

## Fonte e escopo

Requisitos abaixo resumem o documento oficial **Protótipo 2.0 - Sistema de Gestão de Alunos**, de setembro de 2026. São critérios do desafio, não uma afirmação de que já estão implementados. O estado técnico atual e as pendências estão em [`backlog.md`](backlog.md); o contexto geral fica em [`copilot-context.md`](copilot-context.md).

### Escopo obrigatório

- Autenticação, logout e proteção de rotas.
- Listagem de alunos com busca, filtro, ordenação e paginação.
- Cadastro com matrícula gerada no backend.
- Detalhes em modo somente leitura.
- Edição com detecção de alterações.
- Inativação lógica com confirmação.
- Estados de carregamento, sucesso, erro e ausência de resultados.
- Persistência, validação no servidor, documentação e testes mínimos.

Fora do escopo obrigatório: recuperação de senha; gestão de turmas, notas ou frequência; envio real de e-mails ou mensagens.

### Perfis de acesso

| Perfil        | Permissões previstas                                    |
| ------------- | ------------------------------------------------------- |
| Administrador | Listar, consultar, cadastrar, editar e inativar alunos. |
| Leitor        | Listar, buscar e consultar detalhes.                    |

A API deve validar as permissões. Esconder um botão na interface não substitui autorização no servidor.

## 1. Login (RN-001 a RN-008)

| ID     | Regra                                                                                      |
| ------ | ------------------------------------------------------------------------------------------ |
| RN-001 | Autenticar usuário previamente disponibilizado por usuário e senha.                        |
| RN-002 | Usuário deve possuir pelo menos 8 caracteres alfanuméricos.                                |
| RN-003 | Senha deve ter de 8 a 20 caracteres, incluindo letras e números.                           |
| RN-004 | Botão **Acessar** desabilitado enquanto os campos estiverem vazios ou inválidos.           |
| RN-005 | Durante o envio, indicar processamento e impedir cliques duplicados.                       |
| RN-006 | Credenciais inválidas devem gerar mensagem genérica, sem revelar qual dado está incorreto. |
| RN-007 | Rota protegida sem sessão válida deve redirecionar ao login; a API deve responder `401`.   |
| RN-008 | Disponibilizar logout e invalidar a sessão local.                                          |

**Divergência atual:** o código usa e-mail no frontend e no DTO do backend, não o identificador alfanumérico descrito pelo protótipo. A implementação também não valida o comprimento/composição requeridos para usuário e senha. Ver [`autenticacao-login.md`](autenticacao-login.md).

## 2. Listagem e filtros (RN-009 a RN-021)

- RN-009: exibir 10 registros por padrão e informar o total encontrado.
- RN-010: disponibilizar pelo menos 25 alunos iniciais para validar três páginas.
- RN-011: ordenar inicialmente por nome crescente.
- RN-012: busca parcial por nome, sem diferenciar maiúsculas/minúsculas e removendo espaços nas extremidades.
- RN-013: busca por matrícula com correspondência por prefixo.
- RN-015: preservar busca, filtro, ordenação e página ao retornar de detalhes/edição.
- RN-016: apresentar carregamento, erro e ausência de resultados.
- As ações de detalhes/edição/exclusão devem ter nomes acessíveis, tooltips, área clicável adequada e foco visível. Exclusão somente para Administrador.
- RN-017: status deve aparecer como texto e indicador visual, não somente por cor.
- RN-018: Ativo em verde e Inativo em cinza.
- RN-019: filtros Todos, Ativos e Inativos.
- RN-020: inativos continuam consultáveis e não aparecem como ativos por padrão.
- RN-021: total e paginação refletem os filtros.

O Protótipo 2.0 não apresenta RN-014; a numeração foi preservada conforme o documento.

## 3. Cadastro (RN-022 a RN-026)

| Campo/regra   | Critério                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| Nome completo | Obrigatório, 3–120 caracteres; permite acentos, espaços, hífen e apóstrofo. |
| E-mail        | Obrigatório, formato válido e único entre registros vigentes.               |
| CPF           | Obrigatório, dígitos verificadores válidos, único e comparado sem máscara.  |
| Telefone      | Obrigatório; validar DDD e número fixo/celular; persistir somente dígitos.  |
| Foto          | Opcional; JPEG ou PNG até 5 MB; permitir pré-visualização e remoção.        |
| Matrícula     | Não é entrada; backend gera valor único e imutável.                         |
| Status        | Novo aluno começa Ativo.                                                    |

- RN-022: botão de cadastro desabilitado enquanto campo obrigatório estiver vazio ou inválido.
- RN-023: validar no frontend e no servidor.
- RN-024: sucesso informa a matrícula criada e retorna à lista.
- RN-025: falha preserva os dados preenchidos.
- RN-026: saída com alterações não salvas solicita confirmação.

## 4. Detalhes (RN-027 a RN-031)

- Exibir nome, CPF, matrícula, e-mail, telefone, status e foto.
- Somente leitura: rótulos e valores descritivos, não campos desabilitados.
- Foto ausente recebe alternativa neutra e acessível; foto presente tem texto alternativo.
- Voltar fecha detalhes e retorna à lista preservando busca, filtro, ordenação e página.

## 5. Edição (RN-032 a RN-039)

- Matrícula e CPF não podem ser alterados; explicar o motivo na interface.
- Nome, e-mail, telefone, status e foto podem ser alterados.
- Salvar começa desabilitado; habilita quando há mudança e os campos alterados são válidos.
- Restaurar os valores originais desabilita salvar novamente.
- Conflito de e-mail informa o problema sem substituir o registro existente.
- Bloquear cliques duplicados e apresentar feedback de sucesso/falha.
- Saída com alterações não salvas solicita confirmação.

## 6. Inativação (RN-041 a RN-047)

- RN-041: excluir logicamente por campo que sinaliza que o aluno não deve aparecer, preservando histórico.
- RN-042: confirmação identifica nome e matrícula e explica que o aluno deixará de aparecer entre os ativos.
- RN-043: cancelar não altera dados; confirmar executa a operação.
- RN-044: confirmação indica processamento e impede envios duplicados.
- RN-045: sucesso atualiza lista e total e exibe feedback.
- RN-046: ao inativar o último item da página, navegar para a página válida anterior.
- RN-047: modal prende foco, responde a Escape e devolve o foco ao acionador.
- Extensões opcionais: registrar data/responsável, restaurar por Administrador e remover fisicamente só sem dependências e com justificativa.

## 7. Estados e respostas da API

| Estado/código       | Resultado esperado                                          |
| ------------------- | ----------------------------------------------------------- |
| Carregando          | Indicar processamento e bloquear duplicidade.               |
| Sucesso             | Informar resultado e atualizar interface.                   |
| Validação           | Associar cada erro ao campo correspondente.                 |
| Sem resultados      | Explicar e permitir limpar filtros.                         |
| Erro de comunicação | Preservar dados quando aplicável e oferecer nova tentativa. |
| Sessão expirada     | Informar e redirecionar ao login.                           |
| Sem permissão       | Ocultar ações e recusar operação no servidor.               |
| `200` / `204`       | Consulta ou atualização bem-sucedida.                       |
| `201`               | Cadastro criado e matrícula retornada.                      |
| `400`               | Requisição malformada.                                      |
| `401`               | Não autenticado.                                            |
| `403`               | Perfil sem permissão.                                       |
| `404`               | Aluno não encontrado.                                       |
| `409`               | Conflito de CPF, e-mail ou versão.                          |
| `422`               | Dados semanticamente inválidos.                             |
| `500`               | Falha interna sem expor detalhes sensíveis.                 |

## 8. Critérios de aceite e testes mínimos

Critérios destacados no protótipo:

- CA-01/CA-02: credenciais válidas criam sessão; inválidas negam acesso com mensagem genérica.
- CA-03: rota protegida sem sessão redireciona ou a API retorna `401`.
- CA-06/CA-07: duplicidade de CPF recusa cadastro; cadastro válido gera matrícula única.
- CA-08/CA-09: salvar edição fica desabilitado sem mudança e volta a desabilitar ao restaurar valores.
- CA-10: Leitor tentando editar via API recebe `403` sem alteração no banco.
- CA-11: inativar o último item mantém uma página válida.
- CA-12: falha de rede no cadastro preserva dados e permite nova tentativa.

Testes mínimos: um unitário de regra de negócio, um teste de integração de endpoint, um fluxo automatizado crítico e evidência de permissões de Administrador e Leitor.
