import { TRPCError } from "@trpc/server";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  isForgedBlockType,
  isInputBlock,
} from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { defaultEmailInputOptions } from "@typebot.io/blocks-inputs/email/constants";
import { defaultPaymentInputOptions } from "@typebot.io/blocks-inputs/payment/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type {
  SessionState,
  TypebotInSession,
} from "@typebot.io/chat-session/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { ReplyEvent } from "@typebot.io/events/schemas";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import type { Group } from "@typebot.io/groups/schemas";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import { byId, isDefined } from "@typebot.io/lib/utils";
import type { Prisma } from "@typebot.io/prisma/types";
import type { AnswerInSessionState } from "@typebot.io/results/schemas/answers";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { defaultSystemMessages } from "@typebot.io/settings/constants";
import { parseVariables } from "@typebot.io/variables/parseVariables";
import type {
  SetVariableHistoryItem,
  Variable,
} from "@typebot.io/variables/schemas";
import { saveDataInResponseVariableMapping } from "./blocks/integrations/httpRequest/saveDataInResponseVariableMapping";
import { resumeChatCompletion } from "./blocks/integrations/legacy/openai/resumeChatCompletion";
import { executeCommandEvent } from "./events/executeCommandEvent";
import { executeReplyEvent } from "./events/executeReplyEvent";
import { executeGroup, parseInput } from "./executeGroup";
import { getNextGroup } from "./getNextGroup";
import { getOutgoingEdgeId } from "./getOutgoingEdgeId";
import { parseReply } from "./parseReply";
import { saveAnswer } from "./queries/saveAnswer";
import { resetSessionState } from "./resetSessionState";
import { saveVariablesValueIfAny } from "./saveVariables";
import type {
  ContinueChatResponse,
  InputMessage,
  Message,
} from "./schemas/api";
import { startBotFlow } from "./startBotFlow";
import type { SkipReply, SuccessReply } from "./types";
import { updateVariablesInSession } from "./updateVariablesInSession";

export type ContinueBotFlowResponse = ContinueChatResponse & {
  newSessionState: SessionState;
  visitedEdges: Prisma.VisitedEdge[];
  setVariableHistory: SetVariableHistoryItem[];
};

type Params = {
  version: 1 | 2;
  state: SessionState;
  startTime?: number;
  textBubbleContentFormat: "richText" | "markdown";
  sessionStore: SessionStore;
};

export const continueBotFlow = async (
  reply: Message | undefined,
  { state, version, startTime, textBubbleContentFormat, sessionStore }: Params,
): Promise<ContinueBotFlowResponse> => {
  if (!state.currentBlockId)
    return startBotFlow({
      message: reply,
      state: resetSessionState(state),
      version,
      textBubbleContentFormat,
      sessionStore,
    });

  let newSessionState = state;
  const setVariableHistory: SetVariableHistoryItem[] = [];

  if (reply?.type === "command") {
    newSessionState = executeCommandEvent({
      state,
      command: reply.command,
    });
  } else {
    const replyEvent = findReplyEvent(newSessionState);
    if (reply && replyEvent) {
      const response = executeReplyEvent({
        state: newSessionState,
        reply,
        replyEvent,
      });
      if (response.updatedState) newSessionState = response.updatedState;
      if (response.setVariableHistory)
        setVariableHistory.push(...response.setVariableHistory);
    }
  }

  if (!newSessionState.currentBlockId)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Current block id is not set",
    });

  const { block, group, blockIndex } = getBlockById(
    newSessionState.currentBlockId,
    newSessionState.typebotsQueue[0].typebot.groups,
  );

  if (!block)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Group / block not found",
    });

  const nonInputProcessResult = await processNonInputBlock({
    block,
    state: newSessionState,
    reply,
    sessionStore,
  });

  newSessionState = nonInputProcessResult.newSessionState;
  setVariableHistory.push(...nonInputProcessResult.setVariableHistory);
  const { firstBubbleWasStreamed } = nonInputProcessResult;

  let continueReply: SuccessReply | SkipReply | undefined;

  if (isInputBlock(block) && isInputMessage(reply)) {
    const parsedReplyResult = await parseReply(reply, {
      block,
      state: newSessionState,
      sessionStore,
    });

    if (parsedReplyResult.status === "fail")
      return {
        ...(await parseRetryMessage(block, {
          textBubbleContentFormat,
          sessionStore,
          state: newSessionState,
        })),
        newSessionState,
        visitedEdges: [],
        setVariableHistory: [],
      };

    const formattedReply =
      "content" in parsedReplyResult && reply?.type === "text"
        ? parsedReplyResult.content
        : undefined;
    newSessionState = await processAndSaveAnswer(
      newSessionState,
      block,
    )(
      isDefined(formattedReply)
        ? { ...reply, type: "text", text: formattedReply }
        : reply,
    );
    continueReply = parsedReplyResult;
  }

  const groupHasMoreBlocks = blockIndex < group.blocks.length - 1;

  const { edgeId: nextEdgeId, isOffDefaultPath } = getOutgoingEdgeId(
    continueReply,
    {
      block,
      state: newSessionState,
      sessionStore,
    },
  );

  const content =
    continueReply && "content" in continueReply
      ? continueReply.content
      : undefined;
  const lastMessageNewFormat =
    reply?.type === "text" && content !== reply?.text ? content : undefined;

  if (groupHasMoreBlocks && !nextEdgeId) {
    const chatReply = await executeGroup(
      {
        ...group,
        blocks: group.blocks.slice(blockIndex + 1),
      } as Group,
      {
        version,
        state: newSessionState,
        visitedEdges: [],
        setVariableHistory,
        firstBubbleWasStreamed,
        startTime,
        textBubbleContentFormat,
        sessionStore,
      },
    );

    return {
      ...chatReply,
      lastMessageNewFormat,
    };
  }

  if (
    !nextEdgeId &&
    newSessionState.typebotsQueue.length === 1 &&
    (newSessionState.typebotsQueue[0].queuedEdges ?? []).length === 0
  )
    return {
      messages: [],
      newSessionState,
      lastMessageNewFormat,
      visitedEdges: [],
      setVariableHistory,
    };

  const nextGroup = await getNextGroup({
    state: newSessionState,
    edgeId: nextEdgeId,
    isOffDefaultPath,
    sessionStore,
  });

  newSessionState = nextGroup.newSessionState;

  if (!nextGroup.group)
    return {
      messages: [],
      newSessionState,
      lastMessageNewFormat,
      visitedEdges: nextGroup.visitedEdge ? [nextGroup.visitedEdge] : [],
      setVariableHistory,
    };

  const chatReply = await executeGroup(nextGroup.group, {
    version,
    state: newSessionState,
    firstBubbleWasStreamed,
    visitedEdges: nextGroup.visitedEdge ? [nextGroup.visitedEdge] : [],
    setVariableHistory,
    startTime,
    textBubbleContentFormat,
    sessionStore,
  });

  return {
    ...chatReply,
    lastMessageNewFormat,
  };
};

const processNonInputBlock = async ({
  block,
  state,
  reply,
  sessionStore,
}: {
  block: Block;
  state: SessionState;
  reply: Message | undefined;
  sessionStore: SessionStore;
}) => {
  if (reply?.type !== "text")
    return {
      newSessionState: state,
      setVariableHistory: [],
      firstBubbleWasStreamed: false,
    };

  const setVariableHistory: SetVariableHistoryItem[] = [];
  let variableToUpdate: Variable | undefined;
  let newSessionState = state;
  let firstBubbleWasStreamed = false;

  if (block.type === LogicBlockType.SET_VARIABLE) {
    const existingVariable = state.typebotsQueue[0].typebot.variables.find(
      byId(block.options?.variableId),
    );
    if (existingVariable && reply) {
      variableToUpdate = {
        ...existingVariable,
      };
    }
  }
  // Legacy
  else if (
    block.type === IntegrationBlockType.OPEN_AI &&
    block.options?.task === "Create chat completion"
  ) {
    firstBubbleWasStreamed = true;
    if (reply) {
      const result = await resumeChatCompletion(state, {
        options: block.options,
        outgoingEdgeId: block.outgoingEdgeId,
      })(reply.text);
      newSessionState = result.newSessionState;
    }
  } else if (
    reply &&
    (block.type === IntegrationBlockType.HTTP_REQUEST ||
      block.type === LogicBlockType.WEBHOOK)
  ) {
    let response: {
      statusCode?: number;
      data?: unknown;
    };
    try {
      response = JSON.parse(reply.text);
    } catch (err) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Provided response is not valid JSON",
        cause: (await parseUnknownError({ err })).description,
      });
    }
    const result = saveDataInResponseVariableMapping({
      state,
      blockType: block.type,
      blockId: block.id,
      responseVariableMapping: block.options?.responseVariableMapping,
      outgoingEdgeId: block.outgoingEdgeId,
      response,
      sessionStore,
    });
    if (result.newSessionState) newSessionState = result.newSessionState;
  } else if (isForgedBlockType(block.type)) {
    if (reply) {
      const options = (block as ForgedBlock).options;
      const action = forgedBlocks[block.type].actions.find(
        (a) => a.name === options?.action,
      );
      if (action) {
        if (action.run?.stream?.getStreamVariableId) {
          firstBubbleWasStreamed = true;
          variableToUpdate = state.typebotsQueue[0].typebot.variables.find(
            (v) => v.id === action?.run?.stream?.getStreamVariableId(options),
          );
        }

        if (
          action.run?.web?.displayEmbedBubble?.waitForEvent?.getSaveVariableId
        ) {
          variableToUpdate = state.typebotsQueue[0].typebot.variables.find(
            (v) =>
              v.id ===
              action?.run?.web?.displayEmbedBubble?.waitForEvent?.getSaveVariableId?.(
                options,
              ),
          );
        }
      }
    }
  } else if (
    block.type === BubbleBlockType.EMBED &&
    block.content?.waitForEvent?.saveDataInVariableId
  ) {
    variableToUpdate = state.typebotsQueue[0].typebot.variables.find(
      (v) => v.id === block.content?.waitForEvent?.saveDataInVariableId,
    );
  }

  if (variableToUpdate) {
    const { newSetVariableHistory, updatedState } = updateVariablesInSession({
      state: newSessionState,
      currentBlockId: block.id,
      newVariables: [
        {
          ...variableToUpdate,
          value: reply?.text ? safeJsonParse(reply?.text) : undefined,
        },
      ],
    });
    newSessionState = updatedState;
    setVariableHistory.push(...newSetVariableHistory);
  }

  return {
    newSessionState,
    setVariableHistory,
    firstBubbleWasStreamed,
  };
};

const processAndSaveAnswer =
  (state: SessionState, block: InputBlock) =>
  async (reply: InputMessage | undefined): Promise<SessionState> => {
    if (!reply) return state;
    return saveAnswerInDb(state, block)(reply);
  };

const parseRetryMessage = async (
  block: InputBlock,
  {
    textBubbleContentFormat,
    sessionStore,
    state,
  }: {
    textBubbleContentFormat: "richText" | "markdown";
    sessionStore: SessionStore;
    state: SessionState;
  },
): Promise<Pick<ContinueChatResponse, "messages" | "input">> => {
  const retryMessage =
    block.options &&
    "retryMessageContent" in block.options &&
    block.options.retryMessageContent
      ? parseVariables(block.options.retryMessageContent, {
          variables: state.typebotsQueue[0].typebot.variables,
          sessionStore,
        })
      : parseDefaultRetryMessage(block, {
          currentTypebot: state.typebotsQueue[0].typebot,
          sessionStore,
        });
  return {
    messages: [
      {
        id: block.id,
        type: BubbleBlockType.TEXT,
        content:
          textBubbleContentFormat === "richText"
            ? {
                type: "richText",
                richText: [{ type: "p", children: [{ text: retryMessage }] }],
              }
            : {
                type: "markdown",
                markdown: retryMessage,
              },
      },
    ],
    input: await parseInput(block, { state, sessionStore }),
  };
};

const parseDefaultRetryMessage = (
  block: InputBlock,
  {
    currentTypebot,
    sessionStore,
  }: {
    currentTypebot: TypebotInSession;
    sessionStore: SessionStore;
  },
): string => {
  switch (block.type) {
    case InputBlockType.EMAIL:
      return defaultEmailInputOptions.retryMessageContent;
    case InputBlockType.PAYMENT:
      return defaultPaymentInputOptions.retryMessageContent;
    default:
      return currentTypebot.systemMessages?.invalidMessage
        ? parseVariables(currentTypebot.systemMessages.invalidMessage, {
            variables: currentTypebot.variables,
            sessionStore,
          })
        : defaultSystemMessages.invalidMessage;
  }
};

const saveAnswerInDb =
  (state: SessionState, block: InputBlock) =>
  async (reply: InputMessage): Promise<SessionState> => {
    let newSessionState = state;
    const replyContent = reply.type === "audio" ? reply.url : reply.text;
    const attachedFileUrls =
      reply.type === "text" ? reply.attachedFileUrls : undefined;
    await saveAnswer({
      answer: {
        blockId: block.id,
        content: replyContent,
        attachedFileUrls,
      },
      state,
    });

    newSessionState = {
      ...saveVariablesValueIfAny(newSessionState, block)(reply),
      previewMetadata: state.typebotsQueue[0].resultId
        ? newSessionState.previewMetadata
        : {
            ...newSessionState.previewMetadata,
            answers: (newSessionState.previewMetadata?.answers ?? []).concat({
              blockId: block.id,
              content: replyContent,
              attachedFileUrls,
            }),
          },
    };

    const key = block.options?.variableId
      ? newSessionState.typebotsQueue[0].typebot.variables.find(
          (variable) => variable.id === block.options?.variableId,
        )?.name
      : parseGroupKey(block.id, { state: newSessionState });

    return setNewAnswerInState(newSessionState)({
      key: key ?? block.id,
      value:
        (attachedFileUrls ?? []).length > 0
          ? `${attachedFileUrls!.join(", ")}\n\n${replyContent}`
          : replyContent,
    });
  };

const parseGroupKey = (blockId: string, { state }: { state: SessionState }) => {
  const group = state.typebotsQueue[0].typebot.groups.find((group) =>
    group.blocks.find((b) => b.id === blockId),
  );
  if (!group) return;

  const inputBlockNumber = group.blocks
    .filter(isInputBlock)
    .findIndex((b) => b.id === blockId);

  return inputBlockNumber > 0
    ? `${group.title} (${inputBlockNumber})`
    : group?.title;
};

const setNewAnswerInState =
  (state: SessionState) => (newAnswer: AnswerInSessionState) => {
    const answers = state.typebotsQueue[0].answers;
    const newAnswers = answers
      .filter((answer) => answer.key !== newAnswer.key)
      .concat(newAnswer);

    return {
      ...state,
      progressMetadata: state.progressMetadata
        ? { totalAnswers: state.progressMetadata.totalAnswers + 1 }
        : undefined,
      typebotsQueue: state.typebotsQueue.map((typebot, index) =>
        index === 0
          ? {
              ...typebot,
              answers: newAnswers,
            }
          : typebot,
      ),
    } satisfies SessionState;
  };

export const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const findReplyEvent = (state: SessionState): ReplyEvent | undefined =>
  state.typebotsQueue[0].typebot.events?.find(
    (e) => e.type === EventType.REPLY,
  );

const isInputMessage = (
  message: Message | undefined,
): message is InputMessage => message?.type !== "command";
