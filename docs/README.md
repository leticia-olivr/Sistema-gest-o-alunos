# Documentação

O documento oficial de requisitos é o **Protótipo 2.0 - Sistema de Gestão de Alunos** (setembro de 2026). Esta pasta registra o projeto, a implementação atual e as pendências; não substitui o protótipo nem afirma que requisitos ainda não desenvolvidos estão concluídos.

## Documentos

| Documento                                        | Conteúdo                                                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| [`../README.md`](../README.md)                   | Visão rápida, requisitos locais, comandos para executar, links de serviços e testes.            |
| [`copilot-context.md`](copilot-context.md)       | Contexto conciso para desenvolvimento e hierarquia das fontes de verdade.                       |
| [`arquitetura.md`](arquitetura.md)               | Tecnologias e arquitetura implementada, fluxos, segurança e diferenças para a arquitetura-alvo. |
| [`regras-negocio.md`](regras-negocio.md)         | Requisitos funcionais do Protótipo 2.0, organizados por fluxo e identificador RN.               |
| [`autenticacao-login.md`](autenticacao-login.md) | Explicação detalhada do login Angular e da autenticação JWT atual no backend.                   |
| [`diagrama-banco.md`](diagrama-banco.md)         | Schema real das migrations e dados funcionais que ainda precisam de modelagem.                  |
| [`backlog.md`](backlog.md)                       | Pendências priorizadas para concluir autenticação, alunos e qualidade.                          |

## Como manter os documentos

- Alterou requisito? Atualize `regras-negocio.md` e mantenha a referência ao protótipo oficial.
- Alterou arquitetura ou configuração? Atualize `arquitetura.md`.
- Criou/alterou migration? Atualize `diagrama-banco.md` com o schema real, sem misturar tabelas planejadas.
- Implementou ou descobriu uma pendência? Atualize `backlog.md` e revise o status em `copilot-context.md`.
- Alterou autenticação? Revise `autenticacao-login.md`, `regras-negocio.md` e os critérios correspondentes no backlog.
