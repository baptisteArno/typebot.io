import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { Condition } from "@typebot.io/conditions/schemas";
import { EventType } from "@typebot.io/events/constants";
import type { TEvent } from "@typebot.io/events/schemas";
import { getBlockById } from "@typebot.io/groups/helpers/getBlockById";
import { addPortalEdge } from "../addPortalEdge";
import { getNextBlock } from "../getNextBlock";

export const connectEdgeToNextBlock = ({
  state,
  event,
}: {
  state: SessionState;
  event: TEvent;
}) => {
  if (!state.currentBlockId) return state;

  const resumeMetadata =
    event.type === EventType.REPLY
      ? getNextBlock(state.currentBlockId, {
          typebot: state.typebotsQueue[0].typebot,
        })
      : getBlockById(
          state.currentBlockId,
          state.typebotsQueue[0].typebot.groups,
        );

  if (!resumeMetadata) return state;

  let newSessionState = state;

  const virtualEdgeId = `virtual-${event.id}`;
  const { group, block } = resumeMetadata;
  newSessionState = addPortalEdge(virtualEdgeId, newSessionState, {
    to: { groupId: group.id, blockId: block.id },
  });

  const virtualEdge = {
    id: virtualEdgeId,
    condition: hasExitCondition(event)
      ? event.options.exitCondition.condition
      : undefined,
  };

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

const hasExitCondition = (
  event: TEvent,
): event is TEvent & { options: { exitCondition: { condition: Condition } } } =>
  ("options" in event &&
    event.options &&
    "exitCondition" in event.options &&
    event.options.exitCondition?.isEnabled) ??
  false;
