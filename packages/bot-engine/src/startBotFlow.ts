import { TRPCError } from "@trpc/server";
import type { Prisma } from "@typebot.io/prisma/types";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import { continueBotFlow } from "./continueBotFlow";
import { executeGroup } from "./executeGroup";
import { getFirstEdgeId } from "./getFirstEdgeId";
import { getNextGroup } from "./getNextGroup";
import { resetGlobals } from "./globals";
import { upsertResult } from "./queries/upsertResult";
import type { ContinueChatResponse, Message, StartFrom } from "./schemas/api";
import type { SessionState } from "./schemas/chatSession";

type ChatReply = ContinueChatResponse & {
  newSessionState: SessionState;
  visitedEdges: Prisma.VisitedEdge[];
  setVariableHistory: SetVariableHistoryItem[];
};

type Props = {
  version: 1 | 2;
  message: Message | undefined;
  state: SessionState;
  startFrom?: StartFrom;
  startTime?: number;
  textBubbleContentFormat: "richText" | "markdown";
};

export const startBotFlow = async ({
  version,
  message,
  state,
  startFrom,
  startTime,
  textBubbleContentFormat,
}: Props): Promise<ChatReply> => {
  resetGlobals();
  let newSessionState = state;
  const visitedEdges: Prisma.VisitedEdge[] = [];
  const setVariableHistory: SetVariableHistoryItem[] = [];
  if (startFrom?.type === "group") {
    const group = state.typebotsQueue[0]?.typebot.groups.find(
      (group) => group.id === startFrom.groupId,
    );
    if (!group)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Start group doesn't exist",
      });
    return executeGroup(group, {
      version,
      state: newSessionState,
      visitedEdges,
      setVariableHistory,
      startTime,
      textBubbleContentFormat,
    });
  }
  const firstEdgeId = getFirstEdgeId({
    typebot: newSessionState.typebotsQueue[0]?.typebot,
    startEventId: startFrom?.type === "event" ? startFrom.eventId : undefined,
  });
  if (!firstEdgeId)
    return {
      messages: [],
      newSessionState,
      setVariableHistory: [],
      visitedEdges: [],
    };
  const nextGroup = await getNextGroup({
    state: newSessionState,
    edgeId: firstEdgeId,
    isOffDefaultPath: false,
  });
  newSessionState = nextGroup.newSessionState;
  if (!nextGroup.group)
    return { messages: [], newSessionState, visitedEdges, setVariableHistory };
  const chatReply = await executeGroup(nextGroup.group, {
    version,
    state: newSessionState,
    visitedEdges,
    setVariableHistory,
    startTime,
    textBubbleContentFormat,
  });

  return autoContinueChatIfStartingWithInput({
    message,
    state: newSessionState,
    chatReply,
    textBubbleContentFormat,
    version,
  });
};

const autoContinueChatIfStartingWithInput = async ({
  version,
  message,
  chatReply,
  textBubbleContentFormat,
}: Props & { chatReply: ChatReply }): Promise<ChatReply> => {
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
