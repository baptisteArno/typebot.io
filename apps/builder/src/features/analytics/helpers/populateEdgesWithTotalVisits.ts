import { blockHasItems, isInputBlock } from "@typebot.io/blocks-core/helpers";
import type { Block } from "@typebot.io/blocks-core/schemas/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import type { JumpBlock } from "@typebot.io/blocks-logic/jump/schema";
import { createVirtualEdgeId } from "@typebot.io/bot-engine/addPortalEdge";
import type { GroupV6 } from "@typebot.io/groups/schemas";
import { isDefined } from "@typebot.io/lib/utils";
import type {
  BlockSource,
  Edge,
  Target,
} from "@typebot.io/typebot/schemas/edge";
import type { EdgeWithTotalVisits, TotalAnswers } from "../schemas";
import type { DropoffLogger, TraversalFrame } from "../types";
import { getVisitedEdgeToPropFromId } from "./getVisitedEdgeToPropFromId";

type Params = {
  initialEdge: {
    id: string;
    total: number;
  };
  offDefaultPathEdgeWithTotalVisits: EdgeWithTotalVisits[];
  edges: Edge[];
  groups: GroupV6[];
  totalAnswers: TotalAnswers[];
  logger?: DropoffLogger;
};

/**
 * We already have total users on offDefaultEdges. This function computes the total users on all other edges.
 * We know total answers at each input block, so we can compute the total users on each edge.
 */
export function populateEdgesWithTotalVisits({
  initialEdge,
  offDefaultPathEdgeWithTotalVisits,
  edges,
  groups,
  totalAnswers,
  logger,
}: Params): EdgeWithTotalVisits[] {
  const edgesById = new Map(edges.map((edge) => [edge.id, edge]));
  const groupsById = new Map(groups.map((group) => [group.id, group]));
  const totalAnswersByInputBlockId = new Map(
    totalAnswers.map((answer) => [answer.blockId, answer.total]),
  );

  const offPathEdgeIds = new Set(
    offDefaultPathEdgeWithTotalVisits.map((offPathEdge) => offPathEdge.id),
  );
  const edgeTotalsById = new Map(
    offDefaultPathEdgeWithTotalVisits.map((offPathEdge) => [
      offPathEdge.id,
      offPathEdge.total,
    ]),
  );

  const visitedOffDefaultEdgeIds: Set<string> = new Set();

  const depthFirstFrames: TraversalFrame[] = [
    {
      usersRemaining: initialEdge.total,
      edgeId: initialEdge.id,
      isOffDefaultPath: false,
    },
  ];

  while (depthFirstFrames.length) {
    visitFrame(depthFirstFrames.pop()!, { depth: depthFirstFrames.length });
  }

  return [...edgeTotalsById.entries()].map(([id, total]) => ({
    id,
    total,
    to: getVisitedEdgeToPropFromId(id, { edges }),
  }));

  /* ================================================================ */
  /* Inner helpers                                                     */
  /* ================================================================ */
  function visitFrame(
    { usersRemaining, edgeId, isOffDefaultPath }: TraversalFrame,
    { depth }: { depth: number },
  ) {
    // These checks are to avoid infinite loops.
    // - If usersRemaining is 0 then we don't need to visit this edge.
    // - Since offDefaultPath inject usersRemaining with fixed total answers then we need to skip off default paths if we already visited this edge.
    if (usersRemaining <= 0) return;
    if (isOffDefaultPath && markVisited(visitedOffDefaultEdgeIds, edgeId))
      return;

    if (!offPathEdgeIds.has(edgeId)) {
      edgeTotalsById.set(
        edgeId,
        (edgeTotalsById.get(edgeId) ?? 0) + usersRemaining,
      );
    }

    logger?.(
      `▶︎ visiting ${edgeIdToHumanReadableLabel(edgeId, {
        edges,
        groups,
        offDefaultPathEdgeWithTotalVisits,
      })}`,
      {
        usersRemaining,
        depth,
      },
    );

    const edge = edgesById.get(edgeId);
    if (!edge?.to) return;

    const group = groupsById.get(edge.to.groupId);
    if (!group) return;

    let remainingForNextDefaultOutgoingEdge = usersRemaining;

    for (const block of sliceFrom(group.blocks, edge.to.blockId)) {
      if (isInputBlock(block)) {
        remainingForNextDefaultOutgoingEdge =
          totalAnswersByInputBlockId.get(block.id) ?? 0;
        totalAnswersByInputBlockId.delete(block.id);
      }

      for (const itemEdgeId of outgoingItemEdges(block)) {
        const itemTotal = edgeTotalsById.get(itemEdgeId);
        if (itemTotal && itemTotal > 0) {
          enqueue({
            edgeId: itemEdgeId,
            usersRemaining: itemTotal,
            isOffDefaultPath: true,
          });
          remainingForNextDefaultOutgoingEdge -= itemTotal;
        }
      }

      if (isJump(block)) {
        const virtualId = createVirtualEdgeId(block.options);
        const virtualTotal = edgeTotalsById.get(virtualId);
        if (virtualTotal && virtualTotal > 0) {
          enqueue({
            edgeId: virtualId,
            usersRemaining: virtualTotal,
            isOffDefaultPath: true,
          });
        }
      }

      if (block.outgoingEdgeId) {
        enqueue({
          edgeId: block.outgoingEdgeId,
          usersRemaining: remainingForNextDefaultOutgoingEdge,
          isOffDefaultPath: false,
        });
      }
    }
  }

  function enqueue({
    edgeId,
    usersRemaining,
    isOffDefaultPath,
  }: {
    edgeId: string;
    usersRemaining: number;
    isOffDefaultPath: boolean;
  }) {
    if (usersRemaining <= 0) return;
    depthFirstFrames.push({ edgeId, usersRemaining, isOffDefaultPath });
  }
}

const sliceFrom = (blocks: Block[], startId?: string) =>
  startId ? blocks.slice(blocks.findIndex((b) => b.id === startId)) : blocks;

const outgoingItemEdges = (block: Block) => {
  if (!blockHasItems(block)) return [];
  const ids: string[] = [];
  for (const item of block.items ?? []) {
    if (item.outgoingEdgeId) ids.push(item.outgoingEdgeId);
  }
  return ids;
};

const isJump = (
  block: Block,
): block is JumpBlock & { options: { groupId: string } } =>
  block.type === LogicBlockType.JUMP && isDefined(block.options?.groupId);

const edgeIdToHumanReadableLabel = (
  edgeId: string,
  {
    edges,
    groups,
    offDefaultPathEdgeWithTotalVisits,
  }: {
    offDefaultPathEdgeWithTotalVisits: EdgeWithTotalVisits[];
    edges: Edge[];
    groups: GroupV6[];
  },
): string => {
  const edge =
    edges.find((edge) => edge.id === edgeId) ??
    offDefaultPathEdgeWithTotalVisits.find((edge) => edge.id === edgeId);
  if (!edge) throw new Error("Edge not found while debugging edge");

  let label = "[";

  // From
  if ("from" in edge) {
    if ("eventId" in edge.from) label += "Start";
    const fromBlock = groups
      .flatMap((g) => g.blocks)
      .find((block) => block.id === (edge.from as BlockSource).blockId);
    if (fromBlock) label += fromBlock?.type;
  }

  // To
  const toGroup = groups.find(
    (group) => group.id === (edge.to as Target).groupId,
  );
  if (!toGroup) throw new Error("Group not found while debugging edge");
  label += " -> " + toGroup?.title;
  if (edge.to?.blockId) {
    const toBlock = toGroup.blocks.find(
      (block) => block.id === (edge.to as Target).blockId,
    );
    if (toBlock) label += " > " + toBlock?.type;
  }

  label += "]";
  return label;
};

const markVisited = (visitedEdgeIds: Set<string>, edgeId: string): boolean => {
  if (visitedEdgeIds.has(edgeId)) return true;
  visitedEdgeIds.add(edgeId);
  return false;
};
