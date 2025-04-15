import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  isBubbleBlock,
  isInputBlock,
  isIntegrationBlock,
  isLogicBlock,
} from "@typebot.io/blocks-core/helpers";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { env } from "@typebot.io/env";
import type { Group } from "@typebot.io/groups/schemas";
import { byId, isDefined, isNotDefined } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type {
  SetVariableHistoryItem,
  VariableWithValue,
} from "@typebot.io/variables/schemas";
import { executeIntegration } from "./executeIntegration";
import { executeLogic } from "./executeLogic";
import { formatInputForChatResponse } from "./formatInputForChatResponse";
import {
  type BubbleBlockWithDefinedContent,
  parseBubbleBlock,
} from "./parseBubbleBlock";
import { upsertResult } from "./queries/upsertResult";
import type { ContinueChatResponse } from "./schemas/api";
import type { ExecuteIntegrationResponse, ExecuteLogicResponse } from "./types";

export type WalkFlowStartingPoint =
  | { type: "group"; group: Group }
  | {
      type: "nextEdge";
      nextEdge?: { id: string; isOffDefaultPath: boolean };
    };

export const walkFlowForward = async (
  startingPoint: WalkFlowStartingPoint,
  {
    state,
    sessionStore,
    version,
    setVariableHistory,
    skipFirstMessageBubble,
    textBubbleContentFormat,
  }: {
    version: 1 | 2;
    state: SessionState;
    sessionStore: SessionStore;
    setVariableHistory: SetVariableHistoryItem[];
    /**
     * Useful to skip the last message that was streamed to the client so we don't need to send it again
     */
    skipFirstMessageBubble?: boolean;
    textBubbleContentFormat: "richText" | "markdown";
  },
) => {
  const timeoutStartTime = Date.now();

  const visitedEdges: Prisma.VisitedEdge[] = [];
  let newSessionState: SessionState = state;

  let input: ContinueChatResponse["input"] | undefined;
  const messages: ContinueChatResponse["messages"] = [];
  const logs: ContinueChatResponse["logs"] = [];
  const clientSideActions: ContinueChatResponse["clientSideActions"] = [];
  let nextEdge: { id: string; isOffDefaultPath: boolean } | undefined =
    startingPoint.type === "nextEdge" ? startingPoint.nextEdge : undefined;

  do {
    const nextGroupResponse =
      startingPoint.type === "group" && !nextEdge
        ? {
            group: startingPoint.group,
            newSessionState,
          }
        : await navigateToNextGroupAndUpdateState({
            state: newSessionState,
            edgeId: nextEdge?.id,
            isOffDefaultPath: nextEdge?.isOffDefaultPath ?? false,
          });
    newSessionState = nextGroupResponse.newSessionState;
    if (!nextGroupResponse?.group) break;
    const executionResponse = await executeGroup(nextGroupResponse.group, {
      version,
      state: newSessionState,
      visitedEdges,
      setVariableHistory,
      skipFirstMessageBubble,
      timeoutStartTime,
      textBubbleContentFormat,
      sessionStore,
    });
    if (executionResponse.logs) logs.push(...executionResponse.logs);
    newSessionState = executionResponse.newSessionState;
    if (executionResponse.visitedEdges)
      visitedEdges.push(...executionResponse.visitedEdges);
    if (executionResponse.setVariableHistory)
      setVariableHistory.push(...executionResponse.setVariableHistory);
    if (executionResponse.messages)
      messages.push(...executionResponse.messages);
    if (executionResponse.input) input = executionResponse.input;
    if (executionResponse.clientSideActions)
      clientSideActions.push(...executionResponse.clientSideActions);

    nextEdge = executionResponse.nextEdge;
  } while (
    nextEdge ||
    (!input &&
      (newSessionState.typebotsQueue[0].queuedEdgeIds?.length ||
        newSessionState.typebotsQueue.length > 1))
  );

  return {
    newSessionState,
    logs,
    messages,
    input,
    clientSideActions,
    visitedEdges,
    setVariableHistory,
  };
};

type ContextProps = {
  version: 1 | 2;
  state: SessionState;
  sessionStore: SessionStore;
  currentLastBubbleId?: string;
  skipFirstMessageBubble?: boolean;
  visitedEdges: Prisma.VisitedEdge[];
  setVariableHistory: SetVariableHistoryItem[];
  timeoutStartTime?: number;
  textBubbleContentFormat: "richText" | "markdown";
};

export type ExecuteGroupResponse = ContinueChatResponse & {
  newSessionState: SessionState;
  setVariableHistory: SetVariableHistoryItem[];
  visitedEdges: Prisma.VisitedEdge[];
  nextEdge?: {
    id: string;
    isOffDefaultPath: boolean;
  };
};

const executeGroup = async (
  group: Group,
  {
    version,
    state,
    sessionStore,
    visitedEdges,
    setVariableHistory,
    currentLastBubbleId,
    skipFirstMessageBubble,
    timeoutStartTime,
    textBubbleContentFormat,
  }: ContextProps,
): Promise<ExecuteGroupResponse> => {
  const messages: ContinueChatResponse["messages"] = [];
  let clientSideActions: ContinueChatResponse["clientSideActions"] = [];
  let logs: ContinueChatResponse["logs"] = [];
  let nextEdge;
  let lastBubbleBlockId: string | undefined = currentLastBubbleId;

  let newSessionState = state;

  let index = -1;
  for (const block of group.blocks) {
    if (
      timeoutStartTime &&
      env.CHAT_API_TIMEOUT &&
      Date.now() - timeoutStartTime > env.CHAT_API_TIMEOUT
    ) {
      throw new TRPCError({
        code: "TIMEOUT",
        message: `${env.CHAT_API_TIMEOUT / 1000} seconds timeout reached`,
      });
    }

    index++;
    nextEdge = block.outgoingEdgeId
      ? {
          id: block.outgoingEdgeId,
          isOffDefaultPath: false,
        }
      : undefined;

    if (isBubbleBlock(block)) {
      if (!block.content || (skipFirstMessageBubble && index === 0)) continue;
      const message = parseBubbleBlock(block as BubbleBlockWithDefinedContent, {
        version,
        variables: newSessionState.typebotsQueue[0].typebot.variables,
        typebotVersion: newSessionState.typebotsQueue[0].typebot.version,
        textBubbleContentFormat,
        sessionStore,
      });
      messages.push(message);
      if (
        message.type === BubbleBlockType.EMBED &&
        message.content.waitForEvent?.isEnabled
      ) {
        return {
          messages,
          newSessionState: {
            ...newSessionState,
            currentBlockId: block.id,
          },
          clientSideActions,
          logs,
          visitedEdges,
          setVariableHistory,
        };
      }

      lastBubbleBlockId = block.id;
      continue;
    }

    if (isInputBlock(block))
      return {
        messages,
        input: await formatInputForChatResponse(block, {
          state: newSessionState,
          sessionStore,
        }),
        newSessionState: {
          ...newSessionState,
          currentBlockId: block.id,
        },
        clientSideActions,
        logs,
        visitedEdges,
        setVariableHistory,
      };
    const logicOrIntegrationExecutionResponse = (
      isLogicBlock(block)
        ? await executeLogic({
            block,
            state: newSessionState,
            setVariableHistory,
            sessionStore,
          })
        : isIntegrationBlock(block)
          ? await executeIntegration({
              block,
              state: newSessionState,
              sessionStore,
            })
          : null
    ) as ExecuteLogicResponse | ExecuteIntegrationResponse | null;

    if (!logicOrIntegrationExecutionResponse) continue;
    if (
      logicOrIntegrationExecutionResponse.newSetVariableHistory &&
      logicOrIntegrationExecutionResponse.newSetVariableHistory?.length > 0
    ) {
      if (!newSessionState.typebotsQueue[0].resultId)
        newSessionState = {
          ...newSessionState,
          previewMetadata: {
            ...newSessionState.previewMetadata,
            setVariableHistory: (
              newSessionState.previewMetadata?.setVariableHistory ?? []
            ).concat(
              logicOrIntegrationExecutionResponse.newSetVariableHistory.map(
                (item) => ({
                  blockId: item.blockId,
                  variableId: item.variableId,
                  value: item.value,
                }),
              ),
            ),
          },
        };
      else
        setVariableHistory.push(
          ...logicOrIntegrationExecutionResponse.newSetVariableHistory,
        );
    }

    if (
      "startTimeShouldBeUpdated" in logicOrIntegrationExecutionResponse &&
      logicOrIntegrationExecutionResponse.startTimeShouldBeUpdated
    )
      timeoutStartTime = Date.now();
    if (logicOrIntegrationExecutionResponse.logs)
      logs = [...(logs ?? []), ...logicOrIntegrationExecutionResponse.logs];
    if (logicOrIntegrationExecutionResponse.newSessionState)
      newSessionState = logicOrIntegrationExecutionResponse.newSessionState;
    if (
      "clientSideActions" in logicOrIntegrationExecutionResponse &&
      logicOrIntegrationExecutionResponse.clientSideActions
    ) {
      clientSideActions = [
        ...(clientSideActions ?? []),
        ...logicOrIntegrationExecutionResponse.clientSideActions.map(
          (action) => ({
            ...action,
            lastBubbleBlockId,
          }),
        ),
      ];
      if (
        "customEmbedBubble" in logicOrIntegrationExecutionResponse &&
        logicOrIntegrationExecutionResponse.customEmbedBubble
      ) {
        messages.push({
          id: createId(),
          ...logicOrIntegrationExecutionResponse.customEmbedBubble,
        });
      }
      if (
        logicOrIntegrationExecutionResponse.clientSideActions?.find(
          (action) => action.expectsDedicatedReply,
        ) ||
        ("customEmbedBubble" in logicOrIntegrationExecutionResponse &&
          logicOrIntegrationExecutionResponse.customEmbedBubble)
      ) {
        return {
          messages,
          newSessionState: {
            ...newSessionState,
            currentBlockId: block.id,
          },
          clientSideActions,
          logs,
          visitedEdges,
          setVariableHistory,
        };
      }
    }

    if (logicOrIntegrationExecutionResponse.outgoingEdgeId) {
      nextEdge = {
        id: logicOrIntegrationExecutionResponse.outgoingEdgeId,
        isOffDefaultPath:
          block.outgoingEdgeId !==
          logicOrIntegrationExecutionResponse.outgoingEdgeId,
      };
      break;
    }
  }

  return {
    nextEdge,
    messages,
    newSessionState,
    clientSideActions,
    logs,
    visitedEdges,
    setVariableHistory,
  };
};

type NextGroup = {
  group?: Group;
  newSessionState: SessionState;
  visitedEdge?: Prisma.VisitedEdge;
};

const navigateToNextGroupAndUpdateState = async ({
  state,
  edgeId,
  isOffDefaultPath,
}: {
  state: SessionState;
  edgeId?: string;
  isOffDefaultPath: boolean;
}): Promise<NextGroup> => {
  const nextEdge = state.typebotsQueue[0].typebot.edges.find(byId(edgeId));
  if (!nextEdge) {
    const nextEdgeResponse = popQueuedEdge(state);
    let newSessionState = nextEdgeResponse.state;
    if (newSessionState.typebotsQueue.length > 1) {
      const isMergingWithParent =
        newSessionState.typebotsQueue[0].isMergingWithParent;
      const currentResultId = newSessionState.typebotsQueue[0].resultId;
      if (!isMergingWithParent && currentResultId)
        await upsertResult({
          resultId: currentResultId,
          typebot: newSessionState.typebotsQueue[0].typebot,
          isCompleted: true,
          hasStarted: newSessionState.typebotsQueue[0].answers.length > 0,
        });
      newSessionState = {
        ...newSessionState,
        typebotsQueue: [
          {
            ...newSessionState.typebotsQueue[1],
            typebot: isMergingWithParent
              ? {
                  ...newSessionState.typebotsQueue[1].typebot,
                  variables: newSessionState.typebotsQueue[1].typebot.variables
                    .map((variable) => ({
                      ...variable,
                      value:
                        newSessionState.typebotsQueue[0].typebot.variables.find(
                          (v) => v.name === variable.name,
                        )?.value ?? variable.value,
                    }))
                    .concat(
                      newSessionState.typebotsQueue[0].typebot.variables.filter(
                        (variable) =>
                          isDefined(variable.value) &&
                          isNotDefined(
                            newSessionState.typebotsQueue[1].typebot.variables.find(
                              (v) => v.name === variable.name,
                            ),
                          ),
                      ) as VariableWithValue[],
                    ),
                }
              : newSessionState.typebotsQueue[1].typebot,
            answers: isMergingWithParent
              ? [
                  ...newSessionState.typebotsQueue[1].answers.filter(
                    (incomingAnswer) =>
                      !newSessionState.typebotsQueue[0].answers.find(
                        (currentAnswer) =>
                          currentAnswer.key === incomingAnswer.key,
                      ),
                  ),
                  ...newSessionState.typebotsQueue[0].answers,
                ]
              : newSessionState.typebotsQueue[1].answers,
          },
          ...newSessionState.typebotsQueue.slice(2),
        ],
      } satisfies SessionState;
      if (newSessionState.progressMetadata)
        newSessionState.progressMetadata = {
          ...newSessionState.progressMetadata,
          totalAnswers:
            newSessionState.progressMetadata.totalAnswers +
            newSessionState.typebotsQueue[0].answers.length,
        };
    }
    if (nextEdgeResponse.edgeId)
      return navigateToNextGroupAndUpdateState({
        state: newSessionState,
        edgeId: nextEdgeResponse.edgeId,
        isOffDefaultPath,
      });
    return {
      newSessionState,
    };
  }
  const nextGroup = state.typebotsQueue[0].typebot.groups.find(
    byId(nextEdge.to.groupId),
  );
  if (!nextGroup)
    return {
      newSessionState: state,
    };
  const startBlockIndex = nextEdge.to.blockId
    ? nextGroup.blocks.findIndex(byId(nextEdge.to.blockId))
    : 0;
  const currentVisitedEdgeIndex = isOffDefaultPath
    ? (state.currentVisitedEdgeIndex ?? -1) + 1
    : state.currentVisitedEdgeIndex;
  const resultId = state.typebotsQueue[0].resultId;
  return {
    group: {
      ...nextGroup,
      blocks: nextGroup.blocks.slice(startBlockIndex),
    } as Group,
    newSessionState: {
      ...state,
      currentVisitedEdgeIndex,
      previewMetadata:
        resultId || !isOffDefaultPath
          ? state.previewMetadata
          : {
              ...state.previewMetadata,
              visitedEdges: (state.previewMetadata?.visitedEdges ?? []).concat(
                nextEdge.id,
              ),
            },
    },
    visitedEdge:
      resultId && isOffDefaultPath && !nextEdge.id.startsWith("virtual-")
        ? {
            index: currentVisitedEdgeIndex as number,
            edgeId: nextEdge.id,
            resultId,
          }
        : undefined,
  };
};

const popQueuedEdge = (
  state: SessionState,
): { edgeId?: string; state: SessionState } => {
  const edgeId = state.typebotsQueue[0].queuedEdgeIds?.[0];
  if (!edgeId) return { state };
  return {
    edgeId,
    state: {
      ...state,
      typebotsQueue: [
        {
          ...state.typebotsQueue[0],
          queuedEdgeIds: state.typebotsQueue[0].queuedEdgeIds?.slice(1),
        },
        ...state.typebotsQueue.slice(1),
      ],
    },
  };
};
