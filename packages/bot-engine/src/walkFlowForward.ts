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
import type { Prisma } from "@typebot.io/prisma/types";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import { executeIntegration } from "./executeIntegration";
import { executeLogic } from "./executeLogic";
import { formatInputForChatResponse } from "./formatInputForChatResponse";
import { getNextGroup } from "./getNextGroup";
import {
  type BubbleBlockWithDefinedContent,
  parseBubbleBlock,
} from "./parseBubbleBlock";
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
        : await getNextGroup({
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
  } while (nextEdge);

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
