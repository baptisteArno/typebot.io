import { TRPCError } from "@trpc/server";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { CommandEvent } from "@typebot.io/events/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import { byId } from "@typebot.io/lib/utils";
import { addBlockToTypebotIfMissing } from "../addBlockToTypebotIfMissing";
import { addPortalEdge } from "../addPortalEdge";

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
  const nextEdge = newSessionState.typebotsQueue[0].typebot.edges.find(
    byId(event.outgoingEdgeId),
  );
  if (!nextEdge)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Command event doesn't have a connected edge",
    });
  const nextGroup = newSessionState.typebotsQueue[0].typebot.groups.find(
    byId(nextEdge.to.groupId),
  );
  if (!nextGroup)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Command event doesn't have a connected group",
    });
  const nextBlockIndex = nextGroup.blocks.findIndex(byId(nextEdge.to.blockId));
  newSessionState = addBlockToTypebotIfMissing(
    `virtual-${event.id}-block`,
    newSessionState,
    {
      groupId: nextGroup.id,
      index: nextBlockIndex !== -1 ? nextBlockIndex : 0,
    },
  );
  return {
    ...newSessionState,
    currentBlockId: `virtual-${event.id}-block`,
  };
};
