import { TRPCError } from "@trpc/server";
import type { StartFrom } from "@typebot.io/chat-api/schemas";
import type { TypebotInSession } from "@typebot.io/chat-session/schemas";
import { getFirstEdgeId } from "./getFirstEdgeId";
import type { WalkFlowStartingPoint } from "./walkFlowForward";

export const getStartingPoint = ({
  typebot,
  startFrom,
}: {
  typebot: TypebotInSession;
  startFrom?: StartFrom;
}): WalkFlowStartingPoint | undefined => {
  if (startFrom?.type === "group") {
    const group = typebot.groups.find(
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
    typebot,
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
