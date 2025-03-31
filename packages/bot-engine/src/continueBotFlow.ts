import { TRPCError } from "@trpc/server";
import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import {
  isForgedBlockType,
  isInputBlock,
} from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { defaultChoiceInputOptions } from "@typebot.io/blocks-inputs/choice/constants";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { defaultEmailInputOptions } from "@typebot.io/blocks-inputs/email/constants";
import { defaultFileInputOptions } from "@typebot.io/blocks-inputs/file/constants";
import { defaultPaymentInputOptions } from "@typebot.io/blocks-inputs/payment/constants";
import { defaultPictureChoiceOptions } from "@typebot.io/blocks-inputs/pictureChoice/constants";
import type { InputBlock } from "@typebot.io/blocks-inputs/schema";
import { IntegrationBlockType } from "@typebot.io/blocks-integrations/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type {
  SessionState,
  TypebotInSession,
} from "@typebot.io/chat-session/schemas";
import { env } from "@typebot.io/env";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import type { ForgedBlock } from "@typebot.io/forge-repository/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import type { Group } from "@typebot.io/groups/schemas";
import { parseAllowedFileTypesMetadata } from "@typebot.io/lib/extensionFromMimeType";
import { isURL } from "@typebot.io/lib/isURL";
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
import { parseCardsReply } from "./blocks/cards/parseCardsReply";
import { parseButtonsReply } from "./blocks/inputs/buttons/parseButtonsReply";
import { parseDateReply } from "./blocks/inputs/date/parseDateReply";
import { formatEmail } from "./blocks/inputs/email/formatEmail";
import { parseNumber } from "./blocks/inputs/number/parseNumber";
import { formatPhoneNumber } from "./blocks/inputs/phone/formatPhoneNumber";
import { parsePictureChoicesReply } from "./blocks/inputs/pictureChoice/parsePictureChoicesReply";
import { validateRatingReply } from "./blocks/inputs/rating/validateRatingReply";
import { parseTime } from "./blocks/inputs/time/parseTime";
import { saveDataInResponseVariableMapping } from "./blocks/integrations/httpRequest/saveDataInResponseVariableMapping";
import { resumeChatCompletion } from "./blocks/integrations/legacy/openai/resumeChatCompletion";
import { executeCommandEvent } from "./events/executeCommandEvent";
import { executeGroup, parseInput } from "./executeGroup";
import { getNextGroup } from "./getNextGroup";
import { isInputMessage } from "./helpers/isInputMessage";
import { saveAnswer } from "./queries/saveAnswer";
import { resetSessionState } from "./resetSessionState";
import type {
  ContinueChatResponse,
  InputMessage,
  Message,
} from "./schemas/api";
import { startBotFlow } from "./startBotFlow";
import type { ParsedReply, SkipReply, SuccessReply } from "./types";
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

  if (reply?.type === "command") {
    newSessionState = await executeCommandEvent({
      state,
      command: reply.command,
    });
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
  const { setVariableHistory, firstBubbleWasStreamed } = nonInputProcessResult;

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
    (newSessionState.typebotsQueue[0].queuedEdgeIds ?? []).length === 0
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

const saveVariablesValueIfAny =
  (state: SessionState, block: InputBlock) =>
  (reply: Message): SessionState => {
    let newSessionState = saveAttachmentsVarIfAny({ block, reply, state });
    newSessionState = saveAudioClipVarIfAny({
      block,
      reply,
      state: newSessionState,
    });
    return saveInputVarIfAny({ block, reply, state: newSessionState });
  };

const saveAttachmentsVarIfAny = ({
  block,
  reply,
  state,
}: {
  block: InputBlock;
  reply: Message;
  state: SessionState;
}): SessionState => {
  if (
    reply.type !== "text" ||
    block.type !== InputBlockType.TEXT ||
    !block.options?.attachments?.isEnabled ||
    !block.options?.attachments?.saveVariableId ||
    !reply.attachedFileUrls ||
    reply.attachedFileUrls.length === 0
  )
    return state;

  const variable = state.typebotsQueue[0].typebot.variables.find(
    (variable) => variable.id === block.options?.attachments?.saveVariableId,
  );

  if (!variable) return state;

  const { updatedState } = updateVariablesInSession({
    newVariables: [
      {
        id: variable.id,
        name: variable.name,
        value: Array.isArray(variable.value)
          ? variable.value.concat(reply.attachedFileUrls)
          : reply.attachedFileUrls.length === 1
            ? reply.attachedFileUrls[0]
            : reply.attachedFileUrls,
      },
    ],
    currentBlockId: undefined,
    state,
  });
  return updatedState;
};

const saveAudioClipVarIfAny = ({
  block,
  reply,
  state,
}: {
  block: InputBlock;
  reply: Message;
  state: SessionState;
}): SessionState => {
  if (
    reply.type !== "audio" ||
    block.type !== InputBlockType.TEXT ||
    !block.options?.audioClip?.isEnabled ||
    !block.options?.audioClip?.saveVariableId
  )
    return state;

  const variable = state.typebotsQueue[0].typebot.variables.find(
    (variable) => variable.id === block.options?.audioClip?.saveVariableId,
  );

  if (!variable) return state;

  const { updatedState } = updateVariablesInSession({
    newVariables: [
      {
        id: variable.id,
        name: variable.name,
        value: reply.url,
      },
    ],
    currentBlockId: undefined,
    state,
  });

  return updatedState;
};

const saveInputVarIfAny = ({
  block,
  reply,
  state,
}: {
  block: InputBlock;
  reply: Message;
  state: SessionState;
}): SessionState => {
  if (reply.type !== "text" || !block.options?.variableId) return state;

  const foundVariable = state.typebotsQueue[0].typebot.variables.find(
    (variable) => variable.id === block.options?.variableId,
  );
  if (!foundVariable) return state;

  const { updatedState } = updateVariablesInSession({
    newVariables: [
      {
        ...foundVariable,
        value:
          Array.isArray(foundVariable.value) && reply.text
            ? foundVariable.value.concat(reply.text)
            : reply.text,
      },
    ],
    currentBlockId: undefined,
    state,
  });

  return updatedState;
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

const getOutgoingEdgeId = (
  reply: SuccessReply | SkipReply | undefined,
  {
    block,
    state,
    sessionStore,
  }: {
    block: Block;
    state: SessionState;
    sessionStore: SessionStore;
  },
): { edgeId: string | undefined; isOffDefaultPath: boolean } => {
  if (!reply || reply.status === "skip")
    return { edgeId: block.outgoingEdgeId, isOffDefaultPath: false };
  if (reply.outgoingEdgeId)
    return { edgeId: reply.outgoingEdgeId, isOffDefaultPath: true };
  const variables = state.typebotsQueue[0].typebot.variables;
  if (
    block.type === InputBlockType.CHOICE &&
    !(
      block.options?.isMultipleChoice ??
      defaultChoiceInputOptions.isMultipleChoice
    ) &&
    reply
  ) {
    const matchedItem = block.items.find(
      (item) =>
        parseVariables(item.content, {
          variables,
          sessionStore,
        }).normalize() === reply.content.normalize(),
    );
    if (matchedItem?.outgoingEdgeId)
      return { edgeId: matchedItem.outgoingEdgeId, isOffDefaultPath: true };
  }
  if (
    block.type === InputBlockType.PICTURE_CHOICE &&
    !(
      block.options?.isMultipleChoice ??
      defaultPictureChoiceOptions.isMultipleChoice
    ) &&
    reply
  ) {
    const matchedItem = block.items.find(
      (item) =>
        parseVariables(item.title, { variables, sessionStore }).normalize() ===
        reply.content.normalize(),
    );
    if (matchedItem?.outgoingEdgeId)
      return { edgeId: matchedItem.outgoingEdgeId, isOffDefaultPath: true };
  }
  return { edgeId: block.outgoingEdgeId, isOffDefaultPath: false };
};

const parseReply = async (
  reply: InputMessage | undefined,
  {
    sessionStore,
    state,
    block,
  }: { sessionStore: SessionStore; state: SessionState; block: InputBlock },
): Promise<ParsedReply> => {
  switch (block.type) {
    case InputBlockType.EMAIL: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      const formattedEmail = formatEmail(reply.text);
      if (!formattedEmail) return { status: "fail" };
      return { status: "success", content: formattedEmail };
    }
    case InputBlockType.PHONE: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      const formattedPhone = formatPhoneNumber(
        reply.text,
        block.options?.defaultCountryCode,
      );
      if (!formattedPhone) return { status: "fail" };
      return { status: "success", content: formattedPhone };
    }
    case InputBlockType.URL: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      const isValid = isURL(reply.text, { require_protocol: false });
      if (!isValid) return { status: "fail" };
      return { status: "success", content: reply.text };
    }
    case InputBlockType.CHOICE: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parseButtonsReply(reply.text, {
        block,
        state,
        sessionStore,
      });
    }
    case InputBlockType.NUMBER: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parseNumber(reply.text, {
        options: block.options,
        variables: state.typebotsQueue[0].typebot.variables,
        sessionStore,
      });
    }
    case InputBlockType.DATE: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parseDateReply(reply.text, block);
    }
    case InputBlockType.TIME: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parseTime(reply.text, block.options);
    }
    case InputBlockType.FILE: {
      if (!reply)
        return (block.options?.isRequired ?? defaultFileInputOptions.isRequired)
          ? { status: "fail" }
          : { status: "skip" };

      const replyValue = reply.type === "audio" ? reply.url : reply.text;
      const urls = replyValue.split(", ");
      const hasValidUrls = urls.some((url) =>
        isURL(url, { require_tld: env.S3_ENDPOINT !== "localhost" }),
      );

      const allowedFileTypesMetadata =
        block.options?.allowedFileTypes?.types &&
        block.options?.allowedFileTypes?.types?.length > 0 &&
        block.options?.allowedFileTypes?.isEnabled
          ? parseAllowedFileTypesMetadata(block.options.allowedFileTypes.types)
          : undefined;
      const allFilesAreAllowed = allowedFileTypesMetadata
        ? urls.every((url) => {
            const extension = url.split(".").pop();
            if (!extension) return false;
            return allowedFileTypesMetadata.some(
              (metadata) => metadata.extension === extension,
            );
          })
        : true;

      const status = hasValidUrls && allFilesAreAllowed ? "success" : "fail";
      if (!block.options?.isMultipleAllowed && urls.length > 1)
        return { status, content: replyValue.split(",")[0] };
      return { status, content: replyValue };
    }
    case InputBlockType.PAYMENT: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      if (reply.text === "fail") return { status: "fail" };
      return { status: "success", content: reply.text };
    }
    case InputBlockType.RATING: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      const isValid = validateRatingReply(reply.text, block);
      if (!isValid) return { status: "fail" };
      return { status: "success", content: reply.text };
    }
    case InputBlockType.PICTURE_CHOICE: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parsePictureChoicesReply(reply.text, {
        block,
        state,
        sessionStore,
      });
    }
    case InputBlockType.TEXT: {
      if (!reply) return { status: "fail" };
      return {
        status: "success",
        content: reply.type === "audio" ? reply.url : reply.text,
      };
    }
    case InputBlockType.CARDS: {
      if (!reply || reply.type !== "text") return { status: "fail" };
      return parseCardsReply(reply.text, {
        block,
        state,
        sessionStore,
      });
    }
  }
};

export const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};
