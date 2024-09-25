import { createId } from "@paralleldrive/cuid2";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import type { SessionState } from "./schemas/chatSession";

export const addEdgeToTypebot = (
  state: SessionState,
  edge: Edge,
): SessionState => ({
  ...state,
  typebotsQueue: state.typebotsQueue.map((typebot, index) =>
    index === 0
      ? {
          ...typebot,
          typebot: {
            ...typebot.typebot,
            edges: [...typebot.typebot.edges, edge],
          },
        }
      : typebot,
  ),
});

export const createPortalEdge = ({ to }: Pick<Edge, "to">) => ({
  id: "virtual-" + createId(),
  from: { blockId: "", groupId: "" },
  to,
});
