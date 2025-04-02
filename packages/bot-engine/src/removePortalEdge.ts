import type { SessionState } from "@typebot.io/chat-session/schemas";

export const removePortalEdge = (id: string, state: SessionState) => {
  const existingEdge = state.typebotsQueue[0].typebot.edges.find(
    (e) => e.id === id,
  );
  if (!existingEdge) return state;

  return {
    ...state,
    typebotsQueue: state.typebotsQueue.map((queue, index) =>
      index === 0
        ? {
            ...queue,
            typebot: {
              ...queue.typebot,
              edges: queue.typebot.edges.filter((e) => e.id !== id),
            },
          }
        : queue,
    ),
  };
};
