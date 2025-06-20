import type { Edge } from "@typebot.io/typebot/schemas/edge";

export const getVisitedEdgeToPropFromId = (
  edgeId: string,
  { edges }: { edges: Edge[] },
) =>
  edgeId.startsWith("virtual-")
    ? parseToPropFromVirtualEdgeId(edgeId)
    : (edges.find((edge) => edge.id === edgeId)?.to ?? null);

const parseToPropFromVirtualEdgeId = (edgeId: string) => {
  const [groupId, blockId] = edgeId.split("-").slice(1);
  return { groupId, blockId };
};
