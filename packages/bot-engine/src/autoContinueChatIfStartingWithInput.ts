import {
  type ContinueBotFlowResponse,
  continueBotFlow,
} from "./continueBotFlow";
import { upsertResult } from "./queries/upsertResult";
import type { Message } from "./schemas/api";

type Props = {
  version: 1 | 2;
  message: Message | undefined;
  chatReply: ContinueBotFlowResponse;
  textBubbleContentFormat: "richText" | "markdown";
};

export const autoContinueChatIfStartingWithInput = async ({
  version,
  message,
  chatReply,
  textBubbleContentFormat,
}: Props): Promise<ContinueBotFlowResponse> => {
  if (
    !message ||
    chatReply.messages.length > 0 ||
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
    startTime: Date.now(),
  });
};
