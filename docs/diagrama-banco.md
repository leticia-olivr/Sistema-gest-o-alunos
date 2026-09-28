# Banco de Dados

## Modelo implementado

As migrations atuais criam apenas a tabela `usuario`. O banco configurado é H2 em memória (`jdbc:h2:mem:alunosdb`); os dados são recriados ao reiniciar a aplicação.

```mermaid
erDiagram
	USUARIO {
		BIGINT id PK
		VARCHAR nome
		VARCHAR usuario UK
		VARCHAR senha "hash BCrypt"
		VARCHAR role
		BOOLEAN ativo
		TIMESTAMP data_criacao
	}
```

### Colunas de `usuario`

| Coluna         | Tipo         | Restrição/uso                                                                |
| -------------- | ------------ | ---------------------------------------------------------------------------- |
| `id`           | BIGINT       | Chave primária autoincrementada.                                             |
| `nome`         | VARCHAR(150) | Obrigatório.                                                                 |
| `usuario`      | VARCHAR(50)  | Obrigatório e único; identificador usado no login, alfanumérico com mínimo de 8 caracteres. |
| `senha`        | VARCHAR(255) | Obrigatório; armazenar o hash BCrypt, nunca a senha em texto puro.           |
| `role`         | VARCHAR(50)  | Perfil, por exemplo `ADMIN`.                                                 |
| `ativo`        | BOOLEAN      | Obrigatório, com padrão `TRUE`. O login atual ainda não verifica esse valor. |
| `data_criacao` | TIMESTAMP    | Obrigatório, com padrão `CURRENT_TIMESTAMP`.                                 |

Origem: migrations `V1__init.sql`, `V2__insert_admin.sql`, `V3__add_usuario_login.sql`, `V4__remove_email_from_usuario.sql` e `V5__set_admin_dev_password.sql`. A migration V3 atribui identificadores às contas existentes e define `admin1234` para o administrador inicial; V4 remove o e-mail da conta de autenticação; V5 atualiza o hash para uma senha de desenvolvimento que atende às regras atuais. Não use a credencial seedada em produção.

## Modelo exigido para alunos (a implementar)

O Protótipo 2.0 exige cadastro de alunos, mas ainda não existe entidade, migration ou tabela `aluno` no código. O requisito funcional inclui os seguintes dados; tipos, nomes físicos e relacionamentos devem ser definidos na migration antes da implementação:

| Dado            | Regra funcional                                                           |
| --------------- | ------------------------------------------------------------------------- |
| Nome completo   | Obrigatório, 3–120 caracteres.                                            |
| E-mail          | Obrigatório, válido e único entre registros vigentes.                     |
| CPF             | Obrigatório, validar dígitos e unicidade sem máscara.                     |
| Telefone        | Persistir somente dígitos após validar DDD e número.                      |
| Foto            | Opcional, JPEG/PNG, até 5 MB. Decidir estratégia de armazenamento.        |
| Matrícula       | Gerada pelo backend, única e imutável.                                    |
| Status          | Ativo inicialmente; permitir inativação.                                  |
| Exclusão lógica | Indicador para manter histórico e ocultar registros excluídos dos ativos. |

Não há relacionamento aluno-turma especificado nesta fase obrigatória; turmas estão fora do escopo do protótipo.

## Regras para evoluir o schema

- Criar migrations Flyway novas; não editar migrations já aplicadas em ambientes compartilhados.
- Usar tabelas minúsculas e colunas `snake_case`, conforme convenções do projeto.
- Definir índices/constraints para matrícula, CPF e e-mail únicos; a regra de unicidade de e-mail deve considerar registros vigentes.
- Implementar constraints no banco além das validações da API quando aplicável.
- Atualizar este diagrama quando migrations reais forem adicionadas; manter separado o esquema existente do modelo planejado.
