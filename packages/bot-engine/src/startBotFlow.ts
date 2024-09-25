import { TRPCError } from "@trpc/server";
import type { Prisma } from "@typebot.io/prisma/types";
import type { SetVariableHistoryItem } from "@typebot.io/variables/schemas";
import { executeGroup } from "./executeGroup";
import { getFirstEdgeId } from "./getFirstEdgeId";
import { getNextGroup } from "./getNextGroup";
import type { ContinueChatResponse, StartFrom } from "./schemas/api";
import type { SessionState } from "./schemas/chatSession";

type Props = {
  version: 1 | 2;
  state: SessionState;
  startFrom?: StartFrom;
  startTime?: number;
  textBubbleContentFormat: "richText" | "markdown";
};

export const startBotFlow = async ({
  version,
  state,
  startFrom,
  startTime,
  textBubbleContentFormat,
}: Props): Promise<
  ContinueChatResponse & {
    newSessionState: SessionState;
    visitedEdges: Prisma.VisitedEdge[];
    setVariableHistory: SetVariableHistoryItem[];
  }
> => {
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
  return executeGroup(nextGroup.group, {
    version,
    state: newSessionState,
    visitedEdges,
    setVariableHistory,
    startTime,
    textBubbleContentFormat,
  });
};
