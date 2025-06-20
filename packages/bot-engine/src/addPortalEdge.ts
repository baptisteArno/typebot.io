import type { SessionState } from "@typebot.io/chat-session/schemas";
import type { Edge } from "@typebot.io/typebot/schemas/edge";

export const addVirtualEdge = (
  state: SessionState,
  { to }: Pick<Edge, "to">,
): { newSessionState: SessionState; edgeId: string } => {
  const id = createVirtualEdgeId(to);
  const existingEdge = state.typebotsQueue[0].typebot.edges.find(
    (e) => e.id === id,
  );
  if (
    existingEdge?.to.groupId === to.groupId &&
    existingEdge?.to.blockId === to.blockId
  )
    return { newSessionState: state, edgeId: id };
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
  return { newSessionState, edgeId: id };
};

const createPortalEdge = ({ id, to }: Pick<Edge, "to" | "id">) => ({
  id,
  from: { blockId: "", groupId: "" },
  to,
});

export const createVirtualEdgeId = (to: Edge["to"]) =>
  `virtual-${to.groupId}${to.blockId ? `-${to.blockId}` : ""}`;
