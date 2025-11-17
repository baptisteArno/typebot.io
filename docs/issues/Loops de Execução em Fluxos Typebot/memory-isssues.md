## Plano de Mitigação: Loops de Execução em Fluxos Typebot

### 1. Contexto e Problema

Foi identificado que um fluxo configurado em loop elevou o consumo de memória do processo até ~16GB, indicando ausência de guardrails eficazes contra execuções cíclicas prolongadas. Loops podem ser:

1. Intencionais (ex: retry / menu principal) mas sem limites.
2. Não intencionais (ex: arestas mal configuradas, Jump / Link / Condition levando a um ciclo fechado sem estado de saída).
3. Indiretos via Typebot Link (stack de typebots aninhados) criando recursão.

Impactos:

- Consumo de memória (acúmulo de estado, arrays de mensagens, variáveis, logs, buffers de streaming AI / Webhook).
- Custo infra (OOM kill, swap thrash, escalonamento automático indevido).
- Experiência do usuário final (travamento, lentidão, respostas redundantes).

### 2. Hipóteses Principais de Causa

1. Ausência de limite de passos por sessão (step cap global).
2. Falta de contador de visitas por aresta / bloco para detectar ciclos.
3. Jump / Typebot Link permitindo retorno ao mesmo grafo sem merge adequado de variáveis, perpetuando execução.
4. Reexecução rápida de blocos de integração (ex: webhook com fallback retry) sem backoff.
5. Condições sempre verdadeiras / rotas default mal definidas que formam ciclo 2–3 grupos.
6. Falta de timeout de sessão in-flight (apenas expiry passivo, não ativo durante loop).

### 3. Estratégia em 4 Camadas

#### 3.1 Runtime Guardrails (bloqueio e degradação controlada)

- Step Limit: `MAX_STEPS_PER_SESSION` (ex: default 500, configurável por workspace; hard cap absoluto 2000). Se excedido: marcar sessão como "loop_suspect" e encerrar com mensagem padrão configurável.
- Edge Visit Limit: Mapear (edgeId -> count); se count > `EDGE_VISIT_THRESHOLD` (ex: 25) sinalizar ciclo local. Encerrar ou forçar desvio para bloco de fallback (ex: grupo especial "Loop detected").
- Cycle Detection Estrutural: Durante cada transição armazenar uma janela (ex: últimos 50 blocos). Se uma sequência se repete (algoritmo de detecção de repetição usando hashing rolling) N vezes, interromper.
- Recursion Depth para Typebot Link: `TYPEBOT_LINK_STACK_DEPTH_MAX` (ex: 5). Se excedido, abortar chamada adicional e retornar erro controlado ao usuário.
- Tempo Máximo de Sessão Ativa: `ACTIVE_SESSION_TIME_LIMIT_MS` (ex: 5 minutos contínuos sem input humano real) para evitar loops headless.
- Backoff exponencial para re-execuções automáticas de blocos de integração que retornam erro transitório.

#### 3.2 Observabilidade / Logging Estruturado

Adicionar Log de Execução por sessão (session-execution log) com formato compacto e consultável:

```json
{
  "ts": 1730000000000,
  "sessionId": "cuid...",
  "resultId": "...",
  "step": 123,
  "blockId": "blk_x",
  "groupId": "grp_y",
  "edgeId": "edge_a->b",
  "elapsedMs": 12,
  "variablesMutated": ["lead_email"],
  "stackDepth": 2,
  "repeatEdgeCount": 7,
  "flags": ["edge-repeat"]
}
```

Campos adicionais em eventos de término:

```json
{
  "event": "session_end",
  "reason": "loop_guard_triggered|normal|timeout|depth_exceeded|hard_cap",
  "totalSteps": 512,
  "uniqueEdges": 34,
  "suspectCycles": ["edge_1->edge_2->edge_1"],
  "memorySampleMB": 820
}
```

Armazenamento: inicialmente em tabela leve (ex: ClickHouse / BigQuery) ou S3 (batch JSONL) + índice em Elastic/OpenSearch se já houver. Se infra não pronta, primeiro disponibilizar streaming para stdout + agregador (Datadog / Loki) usando chave `type=bot_session_trace`.

Alertas:

- Métrica: `bot_session_steps_count` (histograma) & `bot_session_guard_terminations_total` (counter por motivo).
- Alerta se p95 de passos > 2x baseline semanal ou guard_terminations > threshold por workspace.

#### 3.3 Análise Estática / Pre-publish

- Ao publicar (ou salvar) o fluxo, executar detecção de ciclos no grafo dirigido (DFS com coloring ou Tarjan SCC). Se ciclo sem passagem por bloco de input / wait / payment (isto é, apenas lógica) marcar como "ciclo não moderado".
- Sugerir inserção de bloco de pausa (WAIT) ou condição de escape baseada em variável.
- Exibir warning com preview de caminho cíclico: `GroupA -> GroupB -> GroupA`.
- Heurística de Risco: ciclo cujo comprimento < 5 e sem blocos de coleta de input = potencial loop rápido.

#### 3.4 UX no Builder

- Badge de risco nos grupos envolvidos.
- Painel "Complexity & Loop Risk": número de SCCs, maior repetição potencial.
- Autosuggest: se usuário adiciona Jump para grupo já ancestral no path, mostrar tooltip "Isto cria um ciclo. Deseja configurar limite?".
- Campo opcional por fluxo: "Limite de iterações deste ciclo" gerando variável/flag usada pelo runtime.

### 4. Pseudo-código Runtime (Detecção Simplificada)

```ts
function nextStep(context) {
  const { session } = context
  session.stepCount++
  if (session.stepCount > HARD_CAP) return end('hard_cap')

  const edge = computeNextEdge()
  if (!edge) return end('normal')

  session.edgeVisits[edge.id] = (session.edgeVisits[edge.id] || 0) + 1
  if (session.edgeVisits[edge.id] > EDGE_VISIT_THRESHOLD) {
    flag('edge-repeat')
  }

  updateRecentSequence(edge.id)
  if (detectPatternRepeat()) return end('loop_guard_triggered')

  if (
    session.startTime + ACTIVE_SESSION_TIME_LIMIT_MS < now() &&
    !session.lastUserInputRecent
  ) {
    return end('timeout')
  }

  return proceed(edge)
}
```

### 5. Estruturas de Dados Propostas

- `stepCount: number`
- `edgeVisits: Record<string, number>` (limpar / compactar após término)
- `recentEdges: string[]` tamanho fixo (ex: 50) com buffer circular para hashing.
- `sequenceHashes: Record<string, number>` para detectar repetições de subsequências (hashing rolling de janelas 3–6).
- `typebotStack: { typebotId; depth; parentEdgeId; mergeMode }[]` para controle de profundidade.

### 6. Métricas & KPIs

- Redução do p95 de passos por sessão anômala > 80% após implantação.
- Tempo médio até detecção < 200ms extra overhead em relação ao baseline.
- Zero OOM relacionados a loops após 2 semanas (monitorar container exit code 137).

### 7. Roadmap (Fases Incrementais)

Fase 1 (Quick Wins – 1 sprint):

- (A) Implementar `stepCount` + `HARD_CAP` (config via env) + motivo de término.
- (B) Log estruturado mínimo por passo (stdout) + counter de terminations.
- (C) Edge visit count + warning log (não interrompe ainda).

Fase 2 (Mitigação Completa – 1-2 sprints):

- (D) Encerrar sessão com mensagem padrão ao exceder EDGE_VISIT_THRESHOLD.
- (E) Guard de profundidade do Typebot Link.
- (F) Evento de sessão final com estatísticas e push para storage analítico.

Fase 3 (Prevenção Proativa – 2 sprints):

- (G) Análise estática de ciclos no builder + warnings.
- (H) UI de Complexity & Loop Risk.
- (I) Configuração custom de limites por workspace (persistir em settings).

Fase 4 (Otimização & Aprimoramento):

- (J) Detecção de padrões repetidos via hashing.
- (K) Backoff / rate-limit para blocos de integração repetidos.
- (L) Sugestões automáticas de ruptura (inserir WAIT / Input) em loops “tight”.

### 8. Riscos & Mitigações

- Falsos positivos interrompendo fluxos legítimos (ex: menus): permitir whitelist de grupo inicial + incremento de limite via variável oculta.
- Overhead de logging: usar amostragem para sessões < 50 passos; log completo apenas após passo 50 ou flag de suspeita.
- Armazenamento de métricas: iniciar em stdout + agregador; apenas depois evoluir para persistência dedicada.

### 9. Quick Wins Recomendados (Imediatos)

1. Adicionar `stepCount` e `HARD_CAP=1000` (env) em `continueBotFlow` e `startBotFlow` antes de cada transição.
2. Introduzir `edgeVisits` incremento em `getNextGroup` e logar quando > 10.
3. Emitir evento de término com razão quando `!nextEdge` vs guard.
4. Expor métrica Prometheus / OpenTelemetry para `bot_session_guard_terminations_total`.
5. Criar dashboard básico (passos p95, terminations, memória RSS processo).

### 10. Próximos Passos Técnicos

- Criar types novos: `LoopTerminationReason` enum.
- Extender `SessionState` (packages/schemas) com campos opcionais: `stepCount`, `edgeVisits`, `startTime`, `suspectCycles`.
- Middleware / helper `incrementAndCheckGuards(state): { newState, terminationReason? }` reutilizado em `startBotFlow` e `continueBotFlow`.
- Testes unitários: simular grafo 2-nós cíclico, grafo com input interrompendo ciclo, stack de Typebot Links > limite.
- Teste de carga focado: gerar loop artificial e verificar interrupção < 2s e memória estável.

### 11. Pontos de Inserção (Entrypoints startChat / continueChat)

Os fluxos de execução expostos via API/SDK iniciam por dois caminhos principais:

1. `startChat` -> (chama) `startSession` -> `startBotFlow`
2. `continueChat` -> (carrega estado) -> `continueBotFlow`

Onde aplicar cada guardrail:

| Guardrail / Métrica    | startBotFlow (fase inicial)                                | continueBotFlow (a cada input ou passo subsequente) | getNextGroup                       | Camada de integração       |
| ---------------------- | ---------------------------------------------------------- | --------------------------------------------------- | ---------------------------------- | -------------------------- |
| stepCount / HARD_CAP   | Incrementar imediatamente antes do primeiro `executeGroup` | Incrementar antes de processar `currentBlockId`     | N/A                                | N/A                        |
| edgeVisits             | Inicializar mapa vazio                                     | Reutilizar mapa existente                           | Incrementar ao resolver `nextEdge` | N/A                        |
| pattern repeat hash    | Buffer iniciado                                            | Atualizar após cada edge                            | Atualizar / verificar              | N/A                        |
| typebotStack depth     | Validar ao empilhar primeiro Typebot                       | Validar antes de empilhar novos via link            | N/A                                | Ao resolver Typebot Link   |
| active session timeout | Registrar `startTime`                                      | Checar a cada chamada                               | N/A                                | N/A                        |
| logging estruturado    | Emitir evento `session_start`                              | Emitir evento por passo + `session_end` se terminar | Emitir log de transição            | Logs adicionais (latência) |

Hooks específicos sugeridos:

- `startSession` (logo após construir `initialState`): adicionar `startTime = Date.now()`, `stepCount = 0`, `edgeVisits = {}`.
- `startBotFlow`: antes de decidir primeiro grupo/bloco, chamar `incrementAndCheckGuards()`.
- `continueBotFlow`: imediatamente no início (linha antes de acessar `currentBlockId`) chamar `incrementAndCheckGuards()`.
- `getNextGroup`: após encontrar `nextEdge`, incrementar `edgeVisits[nextEdge.id]` e avaliar thresholds + atualizar estrutura de detecção de padrões.
- Qualquer ponto que empilhe Typebot (Typebot Link / Jump cross-bot): validar profundidade e abortar se excedida.

Fluxo de término antecipado:

```
continueChat -> continueBotFlow
  -> incrementAndCheckGuards(state)
      -> if terminationReason => retorna resposta com mensagem de encerramento + flag reason
```

Formato de resposta estendida (exemplo adição futura):

```json
{
  "messages": [...],
  "termination": { "reason": "hard_cap", "stepCount": 1001 }
}
```

Justificativa: concentrar a checagem em `startBotFlow` e `continueBotFlow` minimiza difusão de lógica e garante interceptação precoce sem alterar contratos mais internos (`executeGroup`, blocos individuais), reduzindo risco de regressões.

---

Se aprovado, seguir com implementação fase 1 e abrir issues separadas por item (A)-(L).

### 12. Contexto de Persistência & Próxima Retomada

Decisões já tomadas para implementação (Fase 1):

1. Persistência dos novos campos apenas dentro de `ChatSession.state` (JSON) para acelerar rollout (evitar migration agora). Avaliar colunas dedicadas só após termos métricas e necessidade de queries SQL diretas.
2. Campos novos planejados (todos opcionais inicialmente para manter retrocompatibilidade):

- `stepCount?: number`
- `edgeVisits?: Record<string, number>`
- `startTime?: number` (epoch ms no início da sessão)
- `lastStepAt?: number` (timestamp do último incremento para métricas de atividade)
- `terminationReason?: 'hard_cap' | 'edge_repeat' | 'pattern' | 'timeout'`
- `suspectCycles?: string[]`

3. Helper central: `incrementAndCheckGuards(state)` que:

- Inicializa campos quando ausentes.
- Incrementa `stepCount`.
- Checa `HARD_CAP` (env: `LOOP_GUARD_HARD_CAP` default 1000).
- (Posterior) Atualiza edgeVisits (será chamado após `getNextGroup`).
- Retorna `{ newState, terminationReason? }`.

4. Entrypoints onde será plugado na Fase 1: apenas em `startBotFlow` (antes do primeiro grupo) e no início de `continueBotFlow`.
5. Logging mínimo adicional:

- `logger.warn` quando `stepCount >= 0.8 * HARD_CAP`.
- `logger.error` com `terminationReason` quando sessão for encerrada por guardrail.

6. Telemetria (planejado): counters / histograma enviados a partir do ponto de persistência em `saveStateToDatabase` (ou wrapper futuro) sem alterar schema do banco.

Checklist Fase 1 (para próxima sessão de trabalho):
[] Estender `sessionStateSchemaV3` com campos opcionais.
[] Criar arquivo `packages/bot-engine/guards/incrementAndCheckGuards.ts`.
[] Invocar helper em `startBotFlow` e `continueBotFlow` (fail-fast se termination).
[] Adicionar leitura de env `LOOP_GUARD_HARD_CAP` (fallback 1000) em `@typebot.io/env` se apropriado.
[] Ajustar `saveStateToDatabase` para logar `stepCount` & `terminationReason` se presente.
[] Criar teste unitário simples simulando overflow de `stepCount` (mock de small HARD_CAP).

Observações:

- Mantemos contrato externo das APIs sem novo campo de resposta nesta fase; apenas interrompemos gerando zero `messages` + possivelmente mensagem final custom futura (não implementada agora).
- Adiar implementação de `edgeVisits` até segunda parte da Fase 1 caso necessário; primeiro garantir corte global.
- Próximo incremento após corte básico: flag de amostragem para logs completos apenas quando `stepCount > 50`.

Referência rápida (arquivos a editar na próxima iteração):

- `packages/schemas/features/chat/sessionState.ts`
- `packages/bot-engine/startBotFlow.ts` (verificar existência / criar guard call)
- `packages/bot-engine/continueBotFlow.ts`
- `packages/bot-engine/getNextGroup.ts` (fase posterior para edgeVisits)
- `packages/bot-engine/saveStateToDatabase.ts` (logs adicionais)
- `packages/env` (ou onde variáveis são definidas) para `LOOP_GUARD_HARD_CAP`.

Fim do contexto — pronto para retomada.
