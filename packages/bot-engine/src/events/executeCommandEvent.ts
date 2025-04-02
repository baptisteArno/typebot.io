import { TRPCError } from "@trpc/server";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { CommandEvent } from "@typebot.io/events/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import { addPortalEdge } from "../addPortalEdge";
import { executeEvent } from "./executeEvent";

type Props = {
  state: SessionState;
  command: string;
};
export const executeCommandEvent = async ({
  state,
  command,
}: Props): Promise<SessionState> => {
  const event = state.typebotsQueue[0].typebot.events?.find(
    (e) => e.type === EventType.COMMAND && e.options?.command === command,
  ) as CommandEvent | undefined;
  if (!event)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Command event not found",
    });

  let newSessionState = state;
  if (event.options?.resumeAfter && newSessionState.currentBlockId) {
    const { block, group } = getBlockById(
      newSessionState.currentBlockId,
      newSessionState.typebotsQueue[0].typebot.groups,
    );
    if (!block)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Block not found",
      });
    newSessionState = addPortalEdge(`virtual-${event.id}`, newSessionState, {
      to: { groupId: group.id, blockId: block.id },
    });
    newSessionState = {
      ...newSessionState,
      typebotsQueue: [
        {
          ...newSessionState.typebotsQueue[0],
          queuedEdgeIds: newSessionState.typebotsQueue[0].queuedEdgeIds
            ? [
                `virtual-${event.id}`,
                ...newSessionState.typebotsQueue[0].queuedEdgeIds,
              ]
            : [`virtual-${event.id}`],
        },
        ...newSessionState.typebotsQueue.slice(1),
      ],
    };
  }

  return await executeEvent({
    state,
    event,
  });
};
