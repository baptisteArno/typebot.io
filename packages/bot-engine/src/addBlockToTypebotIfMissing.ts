import { BubbleBlockType } from "@typebot.io/blocks-bubbles/constants";
import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { Typebot } from "@typebot.io/typebot/schemas/typebot";

export const addBlockToTypebotIfMissing = (
  id: string,
  state: SessionState,
  { groupId, index }: { groupId: string; index: number },
): SessionState => {
  const doesBlockExist = state.typebotsQueue[0].typebot.groups.some((group) =>
    group.blocks.some((block) => block.id === id),
  );
  if (doesBlockExist) return state;
  return {
    ...state,
    typebotsQueue: state.typebotsQueue.map((queue, tIndex) =>
      tIndex === 0
        ? {
            ...queue,
            typebot: {
              ...queue.typebot,
              groups: queue.typebot.groups.map((group) =>
                group.id === groupId
                  ? {
                      ...group,
                      blocks: [
                        ...group.blocks.slice(0, index),
                        {
                          id,
                          type: BubbleBlockType.TEXT,
                          content: {},
                        },
                        ...group.blocks.slice(index),
                      ],
                    }
                  : group,
              ),
            } as Typebot,
          }
        : queue,
    ),
  };
};
