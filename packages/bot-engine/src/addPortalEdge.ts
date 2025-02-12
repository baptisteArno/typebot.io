import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { Edge } from "@typebot.io/typebot/schemas/edge";

export const addPortalEdge = (
  id: string,
  state: SessionState,
  { to }: Pick<Edge, "to">,
): SessionState => {
  const existingEdge = state.typebotsQueue[0].typebot.edges.find(
    (e) => e.id === id,
  );
  if (
    existingEdge?.to.groupId === to.groupId &&
    existingEdge?.to.blockId === to.blockId
  )
    return state;
  const newSessionState = {
    ...state,
    typebotsQueue: state.typebotsQueue.map((queue, index) =>
      index === 0
        ? {
            ...queue,
            typebot: {
              ...queue.typebot,
              edges: existingEdge
                ? queue.typebot.edges.map((e) =>
                    e.id === id ? { ...e, to } : e,
                  )
                : [...queue.typebot.edges, createPortalEdge({ id, to })],
            },
          }
        : queue,
    ),
  };
  return newSessionState;
};

const createPortalEdge = ({ id, to }: Pick<Edge, "to" | "id">) => ({
  id,
  from: { blockId: "", groupId: "" },
  to,
});
