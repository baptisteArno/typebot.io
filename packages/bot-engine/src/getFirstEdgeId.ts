import { TRPCError } from "@trpc/server";
import { isTypebotInSessionAtLeastV6 } from "./helpers/isTypebotInSessionAtLeastV6";
import type { TypebotInSession } from "./schemas/chatSession";

export const getFirstEdgeId = ({
  typebot,
  startEventId,
}: {
  typebot: TypebotInSession;
  startEventId: string | undefined;
}) => {
  if (startEventId) {
    const event = typebot.events?.find((e) => e.id === startEventId);
    if (!event)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Start event doesn't exist",
      });
    return event.outgoingEdgeId;
  }
  if (isTypebotInSessionAtLeastV6(typebot))
    return typebot.events?.[0].outgoingEdgeId;
  return typebot.groups.at(0)?.blocks.at(0)?.outgoingEdgeId;
};
