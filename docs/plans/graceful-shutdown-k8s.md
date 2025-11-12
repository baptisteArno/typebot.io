# Plano de Implementação: Graceful Shutdown & Drain em Kubernetes

## 1. Objetivo

Garantir que as aplicações `typebot-builder` e `typebot-viewer` desliguem de forma **gradual**, sem perda de requisições ativas, evitando interrupções de sessão do usuário e reduzindo erros durante rollouts e autoscaling.

## 2. Escopo

Inclui:

- Reutilização do endpoint existente `/health` (readiness/liveness) com resposta dinâmica retornando 200 (ready) ou 503 (draining).
- Criação do endpoint `/drain` (POST) para iniciar o processo de desligamento gracioso.
- Ajustes nos Deployments: lifecycle `preStop` chamando `/drain` e aumento de `terminationGracePeriodSeconds` para **180s** (janela confirmada para atender requisições potencialmente long-lived / encerrar conexões persistentes com segurança).
- Implementação de módulo compartilhado `graceful-lifecycle` (`packages/lib/graceful-lifecycle.ts`).
- Headers `Cache-Control: no-store` em `/health` para evitar caching e refletir estado atual.
- Exclusão explícita do endpoint `/healthsql` do fluxo de drain (mantido apenas para checar conectividade DB).

Não inclui (fora do escopo imediato):

- Integração de métricas de memória no HPA (fase futura).
- Refatoração completa de logging ou tracing.
- Remoção de PM2 (compatível, mas adiada).
- Estratégia de pré-drain por memória (fase 2).

## 3. Arquitetura Atual (Resumo)

- Probes usam `/health` para readiness e liveness.
- Antes da mudança não havia `/drain`; desligamento dependia apenas do SIGTERM e `terminationGracePeriodSeconds=30`.
- HPA baseado somente em CPU.
- Agora: estado de drain em memória via módulo compartilhado; forced exit timer configurável.

## 4. Mudanças Propostas (Visão Geral)

| Item                                    | Ação                                                 | Resultado                        |
| --------------------------------------- | ---------------------------------------------------- | -------------------------------- |
| Endpoint `/health`                      | Tornar resposta dinâmica (READY → DRAINING 503)      | Probes mais precisas             |
| Endpoint `/drain`                       | Marca estado interno `isDraining=true` e retorna 202 | Início de graceful shutdown      |
| PreStop hook                            | `curl -fs -X POST http://localhost:<PORT>/drain`     | Transição antes do SIGTERM       |
| Readiness dinâmica                      | Retornar HTTP 503 imediato após drain                | Pod removido rápido do balance   |
| Aumento terminationGracePeriod          | Ajustar para 180s                                    | Janela para concluir requisições |
| Timeout interno forced exit             | kill_timeout - buffer (ex: 180s - 5s)                | Evita travamento                 |
| Métrica memória (fase 2)                | Expor uso RSS/limite                                 | Base futura para HPA memória     |
| Degradar readiness por memória (fase 2) | readiness 503 acima de threshold (>85%)              | Proteção contra OOM              |

## 4.1 Opções de Estratégia de Drain Consideradas

| Opção                                                     | Descrição                                                   | Prós                                                | Contras                                                        | Observações                                            |
| --------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ |
| A. Rota de health dinâmica (/health) + /drain (ESCOLHIDA) | PreStop chama /drain, flag interna faz /health retornar 503 | Simples, padrão Kubernetes, sem dependências extras | Requer pequena mudança de código                               | Permite futura lógica de memória no mesmo handler      |
| B. ReadinessProbe exec + sentinel file                    | PreStop cria `/tmp/draining`, readiness (exec) falha        | Não altera rota HTTP existente                      | Menos visível externamente; não expõe estado draining via HTTP | Útil se quisermos zero mudança na aplicação            |
| C. Kong Upstream (weight=0 ou unhealthy)                  | PreStop usa Admin API para retirar target do balance        | Retira tráfego quase imediato; não toca readiness   | Exige acesso ao Admin API e RBAC; se falhar, tráfego continua  | Pode ser complementar à A para soft-drain antes do 503 |
| D. Patch de label do Pod                                  | PreStop altera label removendo pod do Service               | Evita alterar readiness/rota                        | Necessita permissões de patch de pod; risco se falhar          | Menos explícito em métricas de readiness               |
| E. Sidecar de health                                      | Sidecar responde readiness e controla estado drain          | Isola lógica de lifecycle                           | Adiciona container e complexidade                              | Overkill no estado atual                               |
| F. ReadinessGate + Controller                             | Condição custom altera readiness                            | Integra bem com padrões K8s                         | Precisa controller custom                                      | Só justifica em cenários maiores                       |
| G. Service Mesh (Envoy/Istio/Linkerd)                     | Mesh drena conexões quando sinalizado                       | Recursos avançados (slow start, circuit breaking)   | Requer adoção mesh / complexidade                              | Fora do escopo atual                                   |

### Decisão Final

Adotaremos a Opção A (reutilizar rota `/health` retornando 503 durante drain + rota `/drain` invocada no `preStop`). Motivos:

- Menor dif (apenas duas rotas simples e flag in-memory).
- Visibilidade clara via HTTP e logs (estado `ready` vs `draining`).
- Compatível com futuras extensões (memória, latência, métricas expostas no JSON de health).
- Funciona mesmo sem Kong; Kong permanece opcional como camada complementar para ajuste de peso/slow-start.

Kong poderá ser usado posteriormente para: (i) slow start (rampa de peso), (ii) antecipar retirada de tráfego (set weight=0 antes do 503) e (iii) métricas adicionais de latência por target.

## 5. Endpoints

### 5.1 `/health` (dinâmico: readiness/liveness)

- Método: GET
- Respostas:
  - 200 `{ status: "ready", draining: false, uptimeSeconds, mem: { rss, heapUsed, limitMB } }`
  - 503 `{ status: "draining" }` imediatamente após início do drain (Decisão: estratégia A — retirada rápida; sem fase intermediária 200).
- Liveness continua retornando 200 enquanto processo ativo (500 apenas em estado fatal). Readiness falha com 503.
- Header `Cache-Control: no-store` aplicado.

### 5.2 `/drain`

- Método: POST
- Ações:
  1. Define flag global `isDraining=true`.
  2. Registra timestamp de início.
  3. Inicia timer interno para forced exit (`GRACEFUL_TIMEOUT_MS - GRACEFUL_FORCED_EXIT_BUFFER_MS`).
  4. Log estruturado: `{ event: "drain_start", component, pid }`.
- Resposta: `202 Accepted`.
- Idempotente.

### 5.3 `/healthsql` (fora do ciclo de drain)

- Função: verificação direta de conectividade com o banco.
- Não participa de readiness/liveness nem do fluxo de drain; nunca retorna 503 por causa de drain.
- Respostas: 200 (ok) ou 500 (erro DB) independentemente de `isDraining`.
- Não deve ser usado como probe Kubernetes; serve para diagnóstico pontual.
- Justificativa da exclusão: isolar problemas de banco do mecanismo de desligamento controlado.

## 6. Ciclo de Vida de Shutdown

1. Kubernetes executa `preStop` -> POST `/drain`.
2. Aplicação define `isDraining=true` e passa a retornar 503 em `/health`.
3. Readiness falha (503) → Pod removido do Service/Endpoints.
4. Requisições já em andamento continuam até completar ou até o timer interno disparar.
5. Recebe SIGTERM dentro da janela (`terminationGracePeriodSeconds=180`). Recursos/servidor fecham (`server.close()` / conexões persistentes devem ser liberadas).
6. Forced exit: processo encerra caso ultrapasse o limite configurado (para evitar travamentos).

## 7. Ajustes Kubernetes (Deployments)

Aplicados:

- Probes continuam apontando para `/health`.
- Lifecycle `preStop` executa POST `/drain` (exemplo porta builder 3000, viewer 3001):

```yaml
lifecycle:
  preStop:
    exec:
      command:
        [
          '/bin/sh',
          '-c',
          'curl -fs -X POST http://localhost:3000/drain || true',
        ]
```

- `terminationGracePeriodSeconds: 180` definido para ambos os Deployments.
- Rewrites em Next.js garantem que `/drain` público mapeia para `/api/drain` interno.
- Possível futura annotation `app.graceful/drain-enabled: "true"` (opcional).
- Integração Kong futura pode adicionar weight=0 antes do drain para retirada ainda mais suave.

## 8. Implementação do Módulo Compartilhado

Arquivo: `packages/lib/src/graceful-lifecycle.ts`

Funções:

- `initGraceful({ component })`: inicializa estado (idempotente).
- `triggerDrain({ component })`: ativa drain e agenda forced exit.
- `isDraining()`: retorna booleano.
- `healthSnapshot({ component })`: retorna métricas (uptime, memória) para `/health`.

Env Vars:

- `GRACEFUL_TIMEOUT_MS` (default 170000).
- `GRACEFUL_FORCED_EXIT_BUFFER_MS` (default 5000).

Export consolidado via `packages/lib/index.ts`.

## 9. Estratégia de Readiness Durante Drain

Opções:
A) Imediato: readiness devolve 503 assim que `isDraining=true`. (Simples, remove pod rápido.)
B) Atrasado: manter 200 por N segundos (ex: 5s) para reduzir risco de falhas se o LB reenvia requisições repetidas. (Melhor para tráfego intenso.)
Decisão inicial: A) (simplificar – 503 imediato) conforme seção 4.1. Reavaliar após métricas se fase B (atraso) traz ganhos.

## 10. Detecção de Memória (Fase 2)

- Ler cgroup (`/sys/fs/cgroup/memory.max` ou equivalente) + `process.memoryUsage()`.
- Calcular `usagePercent = rss / limit`.
- Se `usagePercent > 0.85` e não drenando: iniciar pré-drain (set `isDraining=true` + readiness 503).
- Expor métrica interna via `/health` (JSON enriquecido) e futura `/metrics` (Prometheus style) ou Log para Datadog.

## 11. Integração com HPA (Fase 2)

- Adicionar resource metric de memória: `type: Resource` / `name: memory` / `targetAverageUtilization` (ex: 75%).
- Alternativa avançada: Custom metric (tempo médio de resposta ou fila interna) para escalar antecipadamente.

## 12. Edge Cases & Mitigações

| Caso                                  | Risco                        | Mitigação                                                                |
| ------------------------------------- | ---------------------------- | ------------------------------------------------------------------------ |
| Requisição longa > gracePeriod        | Forçado a fechar cedo        | Aumentar gracePeriod / logs para tuning                                  |
| `/drain` falha no preStop             | Sem transição de readiness   | SIGTERM ainda segue; liveness mata se falhar; adicionar retry curl com `sleep 1 && curl ...` |
| Pico de memória súbito                | OOM antes drain              | Pré-drain por threshold + logs métricas                                  |
| Race: drain + novo deploy             | Pod antigo e novo competindo | Readiness 503 rápido no antigo                                           |
| Forçado sem PM2 kill_timeout alinhado | Encerramento abrupto         | Documentar necessidade de env var padronizado                            |
| Cache / proxy armazenando `/health`   | Status stale                 | Header `Cache-Control: no-store`                                         |

## 13. Cronograma (Fases)

Fase 1 (Dia 0–2): Endpoints + ajustes Deploy + gracePeriod.
Fase 1.1 (Dia 3–4): Observabilidade básica (logs structured drain events).
Fase 2 (Semana 2): Memória -> pré-drain + HPA memory metric.
Fase 3 (Semana 3+): Métricas avançadas (latência) e ajuste adaptativo.

## 14. Riscos & Mitigações (Resumo)

- Timeout insuficiente -> Monitorar tempo médio de requisição e ajustar.
- Falha de preStop -> Retry ou fallback direto via SIGTERM.
- Conexões WebSocket persistentes -> Mapear e fechar gracioso antes do forced exit.
- Falta de coordenação kill_timeout vs terminationGracePeriod -> Padronizar em variável única (ex: `GRACEFUL_TIMEOUT_MS`).

## 15. Checklist de Validação

- [ ] `/health` retorna 200 em estado normal.
- [ ] POST `/drain` faz `/health` retornar 503 em <1s (readiness falha).
- [ ] PreStop executa e log `drain_start` aparece.
- [ ] Rollout: zero 5xx por desconexão abrupta comparado baseline.
- [ ] Termination dentro da janela configurada (log start->exit < gracePeriod).
- [ ] Métricas memória capturadas (fase 2).
- [ ] HPA reage a pico de memória (fase 2).

## 16. Assunções

- Será adicionado código de servidor custom ou API Routes para expor endpoints.
- Logs estruturados disponíveis em Datadog (campos: service, env, event, status).
- Aplicações não possuem requisições > 60s como padrão (se houver, reavaliar gracePeriod >90s).

## 17. Próximos Passos Imediatos

Status Fase 1: IMPLEMENTADO (`/health` dinâmico, `/drain`, manifests, módulo compartilhado).

Próximos:

1. Adicionar logs estruturados adicionais (durations entre drain_start e exit).
2. Mapear e fechar conexões WebSocket / streaming no drain (se existirem).
3. Planejar fase memória (threshold pré-drain) + métrica para HPA.
4. Smoke test automatizado validando retorno 503 após POST `/drain`.
5. Revisar tempo real de desligamento em rollouts para validar 180s ou ajustar.

## 18. Referências

- Kubernetes Docs: Graceful Termination & Pod Lifecycle.
- Node.js HTTP server.close behavior.
- Datadog structured logging.

---

Este documento estabelece o blueprint inicial. Ajustes finos ocorrerão após métricas reais de tráfego e latência.
