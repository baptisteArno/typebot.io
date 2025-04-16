import { TRPCError } from "@trpc/server";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import { continueBotFlow } from "./continueBotFlow";
import { getFirstEdgeId } from "./getFirstEdgeId";
import { upsertResult } from "./queries/upsertResult";
import type { Message, StartFrom } from "./schemas/api";
import type { ContinueBotFlowResponse } from "./types";
import { type WalkFlowStartingPoint, walkFlowForward } from "./walkFlowForward";

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
    state: newSessionState,
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

const getStartingPoint = ({
  state,
  startFrom,
}: {
  state: SessionState;
  startFrom?: StartFrom;
}): WalkFlowStartingPoint | undefined => {
  if (startFrom?.type === "group") {
    const group = state.typebotsQueue[0]?.typebot.groups.find(
      (group) => group.id === startFrom.groupId,
    );
    if (!group)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Start group doesn't exist",
      });
    return {
      type: "group",
      group,
    };
  }
  const firstEdgeId = getFirstEdgeId({
    typebot: state.typebotsQueue[0]?.typebot,
    startEventId: startFrom?.type === "event" ? startFrom.eventId : undefined,
  });
  if (!firstEdgeId) return;
  return {
    type: "nextEdge",
    nextEdge: {
      id: firstEdgeId,
      isOffDefaultPath: false,
    },
  };
};

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
