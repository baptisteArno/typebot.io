import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { Condition } from "@typebot.io/conditions/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { TEvent } from "@typebot.io/events/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import type { Group } from "@typebot.io/groups/schemas";
import { byId } from "@typebot.io/lib/utils";
import type { SessionStore } from "@typebot.io/runtime-session-store";
import { addPortalEdge } from "../addPortalEdge";
import { getNextGroup } from "../getNextGroup";

async function getNextBlockById(
  state: SessionState,
  blockId: string,
  groups: Group[],
  sessionStore: SessionStore,
  nextEdgeId?: string,
): Promise<{
  block: Block;
  group: Group;
  blockIndex: number;
  groupIndex: number;
  nextEdgeId?: string;
} | null> {
  const { block, blockIndex, groupIndex } = getBlockById(blockId, groups);

  // If the block is the last block in the group, get the first block in the next group
  if (blockIndex === groups[groupIndex]!.blocks.length - 1) {
    const nextGroup = await getNextGroup({
      state,
      edgeId: nextEdgeId ?? block.outgoingEdgeId,
      isOffDefaultPath: false,
      sessionStore,
    });
    if (!nextGroup.group) {
      return null;
    }

    const firstBlock = nextGroup.group.blocks[0];
    if (!firstBlock) return null;

    return {
      block: firstBlock,
      group: nextGroup.group,
      blockIndex: 0,
      groupIndex: groups.findIndex(byId(nextGroup.group.id)),
    };
  }

  const nextBlockIndex = blockIndex + 1;
  const nextBlock = groups[groupIndex]!.blocks[nextBlockIndex];
  return {
    block: nextBlock,
    group: groups[groupIndex]!,
    blockIndex: nextBlockIndex,
    groupIndex,
  };
}

export const connectEdgeToNextBlock = async ({
  state,
  event,
  sessionStore,
  nextEdgeId,
}: {
  state: SessionState;
  event: TEvent;
  sessionStore: SessionStore;
  nextEdgeId?: string;
}) => {
  if (!state.currentBlockId) return state;

  const resumeMetadata =
    event.type === EventType.REPLY
      ? await getNextBlockById(
          state,
          state.currentBlockId,
          state.typebotsQueue[0].typebot.groups,
          sessionStore,
          nextEdgeId,
        )
      : getBlockById(
          state.currentBlockId,
          state.typebotsQueue[0].typebot.groups,
        );

  if (!resumeMetadata) return state;

  let newSessionState = state;
  let condition: Condition | undefined;

  if (event.type === EventType.REPLY) {
    condition = event.options?.exitCondition?.condition;
  }

  const virtualEdgeId = `virtual-${event.id}`;
  const { group, block } = resumeMetadata;
  newSessionState = addPortalEdge(virtualEdgeId, newSessionState, {
    to: { groupId: group.id, blockId: block.id },
  });

  const virtualEdge = { id: virtualEdgeId, condition };

  newSessionState = {
    ...newSessionState,
    typebotsQueue: [
      {
        ...newSessionState.typebotsQueue[0],
        queuedEdges: newSessionState.typebotsQueue[0].queuedEdges
          ? [virtualEdge, ...newSessionState.typebotsQueue[0].queuedEdges]
          : [virtualEdge],
      },
      ...newSessionState.typebotsQueue.slice(1),
    ],
  };

  return newSessionState;
};
