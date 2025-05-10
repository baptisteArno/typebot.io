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
import { getVisitedEdgeToPropFromId } from "./getVisitedEdgeToPropFromId";

type Logger = (msg: string, ctx?: Record<string, unknown>) => void;

type Frame = { edgeId: string; totalUsers: number; depth: number };

type Params = {
  initialEdge: {
    id: string;
    total: number;
  };
  offDefaultPathEdgeWithTotalVisits: EdgeWithTotalVisits[];
  edges: Edge[];
  groups: GroupV6[];
  totalAnswers: TotalAnswers[];
  logger?: Logger;
};

export function populateEdgesWithTotalVisits({
  initialEdge,
  offDefaultPathEdgeWithTotalVisits,
  edges,
  groups,
  totalAnswers,
  logger,
}: Params): EdgeWithTotalVisits[] {
  const edgesById = new Map(edges.map((e) => [e.id, e]));
  const groupsById = new Map(groups.map((g) => [g.id, g]));
  const totalAnswersByInputBlockId = new Map(
    totalAnswers.map((t) => [t.blockId, t.total]),
  );

  const offDefaultPathEdgeIds = new Set(
    offDefaultPathEdgeWithTotalVisits.map((e) => e.id),
  );
  const totals = new Map<string, number>(
    offDefaultPathEdgeWithTotalVisits.map((e) => [e.id, e.total]),
  );

  const visited = new Set<string>();

  const stack: Frame[] = [
    { edgeId: initialEdge.id, totalUsers: initialEdge.total, depth: 0 },
  ];

  while (stack.length) {
    const { edgeId, totalUsers, depth } = stack.pop()!;

    if (totalUsers <= 0) continue;

    if (!offDefaultPathEdgeIds.has(edgeId)) {
      totals.set(edgeId, (totals.get(edgeId) ?? 0) + totalUsers);
    }

    if (visited.has(edgeId)) continue;
    visited.add(edgeId);

    logger?.(
      `▶︎ visiting ${edgeIdToHumanReadableLabel(edgeId, {
        edges,
        groups,
        offDefaultPathEdgeWithTotalVisits,
      })}`,
      {
        totalUsers,
        depth,
      },
    );

    const edge = edgesById.get(edgeId);
    if (!edge?.to) continue;

    const group = groupsById.get(edge.to.groupId);
    if (!group) continue;

    let remainingForNextDefaultOutgoingEdge = totalUsers;

    for (const block of sliceFrom(group.blocks, edge.to.blockId)) {
      if (isInputBlock(block))
        remainingForNextDefaultOutgoingEdge =
          totalAnswersByInputBlockId.get(block.id) ?? 0;

      for (const itemEdgeId of outgoingItemEdges(block)) {
        const itemTotal = totals.get(itemEdgeId);
        if (itemTotal) {
          enqueue(itemEdgeId, itemTotal, depth + 1);
          remainingForNextDefaultOutgoingEdge -= itemTotal;
        }
      }

      if (isJump(block)) {
        const virtualId = createVirtualEdgeId(block.options);
        const virtualTotal = totals.get(virtualId);
        if (virtualTotal) {
          enqueue(virtualId, virtualTotal, depth + 1);
        }
      }

      if (block.outgoingEdgeId) {
        enqueue(
          block.outgoingEdgeId,
          remainingForNextDefaultOutgoingEdge,
          depth + 1,
        );
      }
    }
  }

  return [...totals.entries()].map(([id, total]) => ({
    id,
    total,
    to: getVisitedEdgeToPropFromId(id, { edges }),
  }));

  function enqueue(id: string, totalUsers: number, depth: number) {
    if (totalUsers <= 0 || visited.has(id)) return;
    stack.push({ edgeId: id, totalUsers, depth });
  }
}

const sliceFrom = (blocks: Block[], startId?: string) =>
  startId ? blocks.slice(blocks.findIndex((b) => b.id === startId)) : blocks;

const outgoingItemEdges = (block: Block) => {
  if (!blockHasItems(block)) return [];
  return (
    block.items?.flatMap((i) => (i.outgoingEdgeId ? [i.outgoingEdgeId] : [])) ??
    []
  );
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
