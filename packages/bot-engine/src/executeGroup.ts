import { createId } from "@paralleldrive/cuid2";
import { TRPCError } from "@trpc/server";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  isBubbleBlock,
  isInputBlock,
  isIntegrationBlock,
  isLogicBlock,
} from "@typebot.io/blocks-core/helpers";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { env } from "@typebot.io/env";
import type { Group } from "@typebot.io/groups/schemas";
import type { Prisma } from "@typebot.io/prisma/types";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { deepParseVariables } from "@typebot.io/variables/deepParseVariables";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import { injectVariableValuesInCardsBlock } from "./blocks/cards/injectVariableValuesInCardsBlock";
import { injectVariableValuesInButtonsInputBlock } from "./blocks/inputs/buttons/injectVariableValuesInButtonsInputBlock";
import { parseDateInput } from "./blocks/inputs/date/parseDateInput";
import { computePaymentInputRuntimeOptions } from "./blocks/inputs/payment/computePaymentInputRuntimeOptions";
import { injectVariableValuesInPictureChoiceBlock } from "./blocks/inputs/pictureChoice/injectVariableValuesInPictureChoiceBlock";
import { executeIntegration } from "./executeIntegration";
import { executeLogic } from "./executeLogic";
import { getNextGroup } from "./getNextGroup";
import { getPrefilledInputValue } from "./getPrefilledValue";
import {
  type BubbleBlockWithDefinedContent,
  parseBubbleBlock,
} from "./parseBubbleBlock";
import type { ContinueChatResponse, RuntimeOptions } from "./schemas/api";
import type { ExecuteIntegrationResponse, ExecuteLogicResponse } from "./types";

type ContextProps = {
  version: 1 | 2;
  state: SessionState;
  sessionStore: SessionStore;
  currentReply?: ContinueChatResponse;
  currentLastBubbleId?: string;
  firstBubbleWasStreamed?: boolean;
  visitedEdges: Prisma.VisitedEdge[];
  setVariableHistory: SetVariableHistoryItem[];
  startTime?: number;
  textBubbleContentFormat: "richText" | "markdown";
};

export const executeGroup = async (
  group: Group,
  {
    version,
    state,
    sessionStore,
    visitedEdges,
    setVariableHistory,
    currentReply,
    currentLastBubbleId,
    firstBubbleWasStreamed,
    startTime,
    textBubbleContentFormat,
  }: ContextProps,
): Promise<
  ContinueChatResponse & {
    newSessionState: SessionState;
    setVariableHistory: SetVariableHistoryItem[];
    visitedEdges: Prisma.VisitedEdge[];
  }
> => {
  let newStartTime = startTime;
  const messages: ContinueChatResponse["messages"] =
    currentReply?.messages ?? [];
  let clientSideActions: ContinueChatResponse["clientSideActions"] =
    currentReply?.clientSideActions;
  let logs: ContinueChatResponse["logs"] = currentReply?.logs;
  let nextEdgeId = null;
  let lastBubbleBlockId: string | undefined = currentLastBubbleId;

  let newSessionState = state;

  let isNextEdgeOffDefaultPath = false;
  let index = -1;
  for (const block of group.blocks) {
    if (
      newStartTime &&
      env.CHAT_API_TIMEOUT &&
      Date.now() - newStartTime > env.CHAT_API_TIMEOUT
    ) {
      throw new TRPCError({
        code: "TIMEOUT",
        message: `${env.CHAT_API_TIMEOUT / 1000} seconds timeout reached`,
      });
    }

    index++;
    nextEdgeId = block.outgoingEdgeId;

    if (isBubbleBlock(block)) {
      if (!block.content || (firstBubbleWasStreamed && index === 0)) continue;
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
        input: await parseInput(block, {
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
    const executionResponse = (
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

    if (!executionResponse) continue;
    if (
      executionResponse.newSetVariableHistory &&
      executionResponse.newSetVariableHistory?.length > 0
    ) {
      if (!newSessionState.typebotsQueue[0].resultId)
        newSessionState = {
          ...newSessionState,
          previewMetadata: {
            ...newSessionState.previewMetadata,
            setVariableHistory: (
              newSessionState.previewMetadata?.setVariableHistory ?? []
            ).concat(
              executionResponse.newSetVariableHistory.map((item) => ({
                blockId: item.blockId,
                variableId: item.variableId,
                value: item.value,
              })),
            ),
          },
        };
      else setVariableHistory.push(...executionResponse.newSetVariableHistory);
    }

    if (
      "startTimeShouldBeUpdated" in executionResponse &&
      executionResponse.startTimeShouldBeUpdated
    )
      newStartTime = Date.now();
    if (executionResponse.logs)
      logs = [...(logs ?? []), ...executionResponse.logs];
    if (executionResponse.newSessionState)
      newSessionState = executionResponse.newSessionState;
    if (
      "clientSideActions" in executionResponse &&
      executionResponse.clientSideActions
    ) {
      clientSideActions = [
        ...(clientSideActions ?? []),
        ...executionResponse.clientSideActions.map((action) => ({
          ...action,
          lastBubbleBlockId,
        })),
      ];
      if (
        "customEmbedBubble" in executionResponse &&
        executionResponse.customEmbedBubble
      ) {
        messages.push({
          id: createId(),
          ...executionResponse.customEmbedBubble,
        });
      }
      if (
        executionResponse.clientSideActions?.find(
          (action) => action.expectsDedicatedReply,
        ) ||
        ("customEmbedBubble" in executionResponse &&
          executionResponse.customEmbedBubble)
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

    if (executionResponse.outgoingEdgeId) {
      isNextEdgeOffDefaultPath =
        block.outgoingEdgeId !== executionResponse.outgoingEdgeId;
      nextEdgeId = executionResponse.outgoingEdgeId;
      break;
    }
  }

  if (
    !nextEdgeId &&
    newSessionState.typebotsQueue.length === 1 &&
    (newSessionState.typebotsQueue[0].queuedEdgeIds ?? []).length === 0
  )
    return {
      messages,
      newSessionState,
      clientSideActions,
      logs,
      visitedEdges,
      setVariableHistory,
    };

  const nextGroup = await getNextGroup({
    state: newSessionState,
    edgeId: nextEdgeId ?? undefined,
    isOffDefaultPath: isNextEdgeOffDefaultPath,
  });

  newSessionState = nextGroup.newSessionState;

  if (nextGroup.visitedEdge) visitedEdges.push(nextGroup.visitedEdge);

  if (!nextGroup.group) {
    return {
      messages,
      newSessionState,
      clientSideActions,
      logs,
      visitedEdges,
      setVariableHistory,
    };
  }

  return executeGroup(nextGroup.group, {
    version,
    state: newSessionState,
    sessionStore,
    visitedEdges,
    setVariableHistory,
    currentReply: {
      messages,
      clientSideActions,
      logs,
    },
    currentLastBubbleId: lastBubbleBlockId,
    startTime: newStartTime,
    textBubbleContentFormat,
  });
};

const computeRuntimeOptions = (
  block: InputBlock,
  { sessionStore, state }: { sessionStore: SessionStore; state: SessionState },
): Promise<RuntimeOptions> | undefined => {
  switch (block.type) {
    case InputBlockType.PAYMENT: {
      return computePaymentInputRuntimeOptions(block.options, {
        sessionStore,
        state,
      });
    }
  }
};

export const parseInput = async (
  block: InputBlock,
  { state, sessionStore }: { state: SessionState; sessionStore: SessionStore },
): Promise<ContinueChatResponse["input"]> => {
  switch (block.type) {
    case InputBlockType.CHOICE: {
      return injectVariableValuesInButtonsInputBlock(block, {
        state,
        sessionStore,
      });
    }
    case InputBlockType.PICTURE_CHOICE: {
      return injectVariableValuesInPictureChoiceBlock(block, {
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
    }
    case InputBlockType.NUMBER: {
      return deepParseVariables(
        {
          ...block,
          prefilledValue: getPrefilledInputValue(
            state.typebotsQueue[0].typebot.variables,
          )(block),
        },
        {
          variables: state.typebotsQueue[0].typebot.variables,
          sessionStore,
        },
      );
    }
    case InputBlockType.DATE: {
      return parseDateInput(block, {
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
    }
    case InputBlockType.RATING: {
      return deepParseVariables(
        {
          ...block,
          prefilledValue: getPrefilledInputValue(
            state.typebotsQueue[0].typebot.variables,
          )(block),
        },
        {
          variables: state.typebotsQueue[0].typebot.variables,
          sessionStore,
        },
      );
    }
    case InputBlockType.CARDS: {
      return injectVariableValuesInCardsBlock(block, {
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
    }
    default: {
      return deepParseVariables(
        {
          ...block,
          runtimeOptions: await computeRuntimeOptions(block, {
            sessionStore,
            state,
          }),
          prefilledValue: getPrefilledInputValue(
            state.typebotsQueue[0].typebot.variables,
          )(block),
        },
        {
          variables: state.typebotsQueue[0].typebot.variables,
          sessionStore,
        },
      );
    }
  }
};
