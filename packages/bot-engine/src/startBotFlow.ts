import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { Message, StartFrom } from "@typebot.io/chat-api/schemas";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import { continueBotFlow } from "./continueBotFlow";
import { getStartingPoint } from "./getStartingPoint";
import { upsertResult } from "./queries/upsertResult";
import type { ContinueBotFlowResponse } from "./types";
import { walkFlowForward } from "./walkFlowForward";

type Props = {
  version: 1 | 2;
  message: Message | undefined;
  state: SessionState;
  startFrom?: StartFrom;
  textBubbleContentFormat: "richText" | "markdown";
  sessionStore: SessionStore;
};

export const startBotFlow = async ({
  version,
  message,
  state,
  sessionStore,
  startFrom,
  textBubbleContentFormat,
}: Props): Promise<ContinueBotFlowResponse> => {
  const newSessionState = state;
  const setVariableHistory: SetVariableHistoryItem[] = [];
  const startingPoint = getStartingPoint({
    typebot: newSessionState.typebotsQueue[0]?.typebot,
    startFrom,
  });
  if (!startingPoint)
    return {
      messages: [],
      newSessionState,
      setVariableHistory: [],
      visitedEdges: [],
    };

  const chatReply = await walkFlowForward(startingPoint, {
    version,
    state: newSessionState,
    sessionStore,
    setVariableHistory,
    textBubbleContentFormat,
  });

  return autoContinueChatIfStartingWithInput({
    message,
    state: newSessionState,
    chatReply,
    textBubbleContentFormat,
    version,
    sessionStore,
  });
};

const inputBlocksWithDisplayedContent = [
  InputBlockType.CARDS,
  InputBlockType.PICTURE_CHOICE,
  InputBlockType.CHOICE,
  InputBlockType.PAYMENT,
];

const autoContinueChatIfStartingWithInput = async ({
  version,
  message,
  chatReply,
  textBubbleContentFormat,
  sessionStore,
}: Props & {
  chatReply: ContinueBotFlowResponse;
}): Promise<ContinueBotFlowResponse> => {
  if (
    !message ||
    chatReply.messages.length > 0 ||
    (chatReply.input &&
      inputBlocksWithDisplayedContent.includes(chatReply.input?.type)) ||
    (chatReply.clientSideActions?.filter((c) => c.expectsDedicatedReply)
      .length ?? 0) > 0
  )
    return chatReply;

  const resultId = chatReply.newSessionState.typebotsQueue[0].resultId;
  if (resultId)
    await upsertResult({
      hasStarted: true,
      isCompleted: false,
      resultId,
      typebot: chatReply.newSessionState.typebotsQueue[0].typebot,
    });
  return continueBotFlow(message, {
    version,
    state: chatReply.newSessionState,
    textBubbleContentFormat: textBubbleContentFormat,
    sessionStore,
  });
};
