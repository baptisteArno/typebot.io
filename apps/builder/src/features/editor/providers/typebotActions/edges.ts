import { createId } from "@paralleldrive/cuid2";
import { blockHasItems, itemHasPaths } from "@typebot.io/blocks-core/helpers";
import type {
  ItemIndices,
  ItemWithPaths,
  PathIndices,
} from "@typebot.io/blocks-core/schemas/items/schema";
import type {
  BlockIndices,
  BlockWithItems,
} from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { byId, isDefined } from "@typebot.io/lib/utils";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import type { Typebot, TypebotV6 } from "@typebot.io/typebot/schemas/typebot";
import { type Draft, produce } from "immer";
import type { SetTypebot } from "../TypebotProvider";

export type EdgesActions = {
  createEdge: (edge: Omit<Edge, "id">) => void;
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, "id">>) => void;
  deleteEdge: (edgeId: string) => void;
};

export const edgesAction = (setTypebot: SetTypebot): EdgesActions => ({
  createEdge: (edge: Omit<Edge, "id">) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const newEdge = {
          ...edge,
          id: createId(),
        };
        removeExistingEdge(typebot, edge);
        typebot.edges.push(newEdge);
        if ("eventId" in edge.from) {
          const eventIndex = typebot.events.findIndex(byId(edge.from.eventId));
          addEdgeIdToEvent(typebot, newEdge.id, {
            eventIndex,
          });
        } else {
          const groupIndex = typebot.groups.findIndex((g) =>
            g.blocks.some(
              (b) => "blockId" in edge.from && b.id === edge.from.blockId,
            ),
          );
          const blockIndex = typebot.groups[groupIndex].blocks.findIndex(
            byId(edge.from.blockId),
          );

          const block = typebot.groups[groupIndex].blocks[blockIndex];
          const itemIndex =
            edge.from.itemId && blockHasItems(block)
              ? block.items.findIndex(byId(edge.from.itemId))
              : null;

          const item = isDefined(itemIndex)
            ? (block as BlockWithItems).items[itemIndex]
            : null;

          const pathIndex =
            item && edge.from.pathId && itemHasPaths(item)
              ? item.paths.findIndex(byId(edge.from.pathId))
              : null;

          if (isDefined(pathIndex) && pathIndex !== -1) {
            addEdgeIdToPath(typebot, newEdge.id, {
              groupIndex,
              blockIndex,
              itemIndex: itemIndex ?? 0,
              pathIndex,
            });
          } else if (isDefined(itemIndex) && itemIndex !== -1) {
            addEdgeIdToItem(typebot, newEdge.id, {
              groupIndex,
              blockIndex,
              itemIndex,
            });
          } else {
            addEdgeIdToBlock(typebot, newEdge.id, {
              groupIndex,
              blockIndex,
            });
          }

          if (isDefined(itemIndex) && isDefined(block.outgoingEdgeId)) {
            const areAllItemsConnected = (block as BlockWithItems).items.every(
              (item) => isDefined(item.outgoingEdgeId),
            );
            if (
              areAllItemsConnected &&
              (block.type === InputBlockType.CHOICE ||
                block.type === InputBlockType.PICTURE_CHOICE)
            ) {
              deleteEdgeDraft({
                typebot,
                edgeId: block.outgoingEdgeId,
                groupIndex,
              });
            }
          }
        }
      }),
    ),
  updateEdge: (edgeIndex: number, updates: Partial<Omit<Edge, "id">>) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const currentEdge = typebot.edges[edgeIndex];
        typebot.edges[edgeIndex] = {
          ...currentEdge,
          ...updates,
        };
      }),
    ),
  deleteEdge: (edgeId: string) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        deleteEdgeDraft({ typebot, edgeId });
      }),
    ),
});

const addEdgeIdToEvent = (
  typebot: Draft<TypebotV6>,
  edgeId: string,
  { eventIndex }: { eventIndex: number },
) => (typebot.events[eventIndex].outgoingEdgeId = edgeId);

const addEdgeIdToBlock = (
  typebot: Draft<Typebot>,
  edgeId: string,
  { groupIndex, blockIndex }: BlockIndices,
) => {
  typebot.groups[groupIndex].blocks[blockIndex].outgoingEdgeId = edgeId;
};

const addEdgeIdToItem = (
  typebot: Draft<Typebot>,
  edgeId: string,
  { groupIndex, blockIndex, itemIndex }: ItemIndices,
) =>
  ((typebot.groups[groupIndex].blocks[blockIndex] as BlockWithItems).items[
    itemIndex
  ].outgoingEdgeId = edgeId);

const addEdgeIdToPath = (
  typebot: Draft<Typebot>,
  edgeId: string,
  { groupIndex, blockIndex, itemIndex, pathIndex }: PathIndices,
) =>
  ((
    (typebot.groups[groupIndex].blocks[blockIndex] as BlockWithItems).items[
      itemIndex
    ] as ItemWithPaths
  ).paths[pathIndex].outgoingEdgeId = edgeId);

export const deleteEdgeDraft = ({
  typebot,
  edgeId,
  groupIndex,
}: {
  typebot: Draft<TypebotV6>;
  edgeId: string;
  groupIndex?: number;
}) => {
  const edgeIndex = typebot.edges.findIndex(byId(edgeId));
  resetOutgoingEdgeIdProp({ typebot, edgeId, groupIndex });
  if (edgeIndex === -1) return;
  typebot.edges.splice(edgeIndex, 1);
};

const resetOutgoingEdgeIdProp = ({
  typebot,
  edgeId,
  groupIndex,
}: {
  typebot: Draft<TypebotV6>;
  edgeId: string;
  groupIndex?: number;
}) => {
  const edge = typebot.edges.find(byId(edgeId));
  if (!edge) return;
  if ("eventId" in edge.from) {
    const event = typebot.events.find(byId(edge.from.eventId));
    if (event) event.outgoingEdgeId = undefined;
    return;
  }
  const group = groupIndex
    ? typebot.groups[groupIndex]
    : typebot.groups.find((group) =>
        group.blocks.some(
          (block) => "blockId" in edge.from && block.id === edge.from.blockId,
        ),
      );
  if (!group) return;

  const block = group.blocks.find(byId(edge.from.blockId));
  if (!block) return;

  const hasItem = "itemId" in edge.from && blockHasItems(block);
  if (hasItem) {
    const item = block.items.find(byId(edge.from.itemId));
    if (!item) return;

    const hasPath = "pathId" in edge.from && itemHasPaths(item);
    if (hasPath) {
      const path = item.paths.find(byId(edge.from.pathId));
      if (!path) return;
      path.outgoingEdgeId = undefined;
      return;
    }

    item.outgoingEdgeId = undefined;
    return;
  }

  block.outgoingEdgeId = undefined;
};

export const deleteConnectedEdgesDraft = (
  typebot: Draft<TypebotV6>,
  deletedNodeId: string,
) => {
  const edgesToDelete = typebot.edges.filter((edge) => {
    if ("eventId" in edge.from)
      return [edge.from.eventId, edge.to.groupId, edge.to.blockId].includes(
        deletedNodeId,
      );

    return [
      edge.from.blockId,
      edge.from.itemId,
      edge.from.pathId,
      edge.to.groupId,
      edge.to.blockId,
    ].includes(deletedNodeId);
  });

  edgesToDelete.forEach((edge) =>
    deleteEdgeDraft({ typebot, edgeId: edge.id }),
  );
};

const removeExistingEdge = (
  typebot: Draft<Typebot>,
  newEdge: Omit<Edge, "id">,
) => {
  typebot.edges = typebot.edges.filter((existingEdge) => {
    if ("eventId" in newEdge.from) {
      if ("eventId" in existingEdge.from)
        return existingEdge.from.eventId !== newEdge.from.eventId;
      return true;
    }

    if ("eventId" in existingEdge.from) return true;

    if (newEdge.from.pathId)
      return existingEdge.from.pathId !== newEdge.from.pathId;
    if (existingEdge.from.pathId) return true;

    if (newEdge.from.itemId)
      return existingEdge.from.itemId !== newEdge.from.itemId;
    if (existingEdge.from.itemId) return true;

    return existingEdge.from.blockId !== newEdge.from.blockId;
  });
};
