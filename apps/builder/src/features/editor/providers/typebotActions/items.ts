import { createId } from "@paralleldrive/cuid2";
import { blockHasItems, itemHasPaths } from "@typebot.io/blocks-core/helpers";
import type {
  Item,
  ItemIndices,
  ItemV6,
} from "@typebot.io/blocks-core/schemas/items/schema";
import type { BlockWithItems } from "@typebot.io/blocks-core/schemas/schema";
import type {
  CardsItem,
  CardsItemPath,
} from "@typebot.io/blocks-inputs/cards/schema";
import type { ButtonItem } from "@typebot.io/blocks-inputs/choice/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import type { PictureChoiceItem } from "@typebot.io/blocks-inputs/pictureChoice/schema";
import type { AbTestBlock } from "@typebot.io/blocks-logic/abTest/schema";
import type { ConditionItem } from "@typebot.io/blocks-logic/condition/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { byId } from "@typebot.io/lib/utils";
import type { Edge } from "@typebot.io/typebot/schemas/edge";
import { type Draft, produce } from "immer";
import type {
  BlockWithCreatableItems,
  DraggableItem,
} from "@/features/graph/providers/GraphDndProvider";
import type { SetTypebot } from "../TypebotProvider";
import { deleteConnectedEdgesDraft } from "./edges";

type NewItem = Pick<DraggableItem, "outgoingEdgeId"> & Partial<DraggableItem>;

export type ItemsActions = {
  createItem: (item: NewItem, indices: ItemIndices) => string | undefined;
  duplicateItem: (indices: ItemIndices) => void;
  updateItem: (
    indices: ItemIndices,
    updates: Partial<Omit<Item, "id">>,
  ) => void;
  detachItemFromBlock: (indices: ItemIndices) => void;
  deleteItem: (indices: ItemIndices) => void;
  deleteItemPath: (indices: ItemIndices & { pathIndex: number }) => void;
};

export const itemsAction = (setTypebot: SetTypebot): ItemsActions => ({
  createItem: (
    item: NewItem,
    { groupIndex, blockIndex, itemIndex }: ItemIndices,
  ) => {
    let newItemId: string | undefined;
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[
          blockIndex
        ] as BlockWithCreatableItems;

        const newItem = createItem(block, item, itemIndex);

        if (!newItem) return;

        if (item.outgoingEdgeId) {
          const edgeIndex = typebot.edges.findIndex(byId(item.outgoingEdgeId));
          edgeIndex !== -1
            ? (typebot.edges[edgeIndex].from = {
                blockId: block.id,
                itemId: newItem.id,
              })
            : (newItem.outgoingEdgeId = undefined);
        }

        newItemId = newItem.id;
      }),
    );

    return newItemId;
  },
  duplicateItem: ({ groupIndex, blockIndex, itemIndex }: ItemIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[
          blockIndex
        ] as BlockWithCreatableItems;
        const { newItem, newEdges } = duplicateItemDraft(
          block.items[itemIndex],
          {
            blockId: block.id,
            blockType: block.type,
            edges: typebot.edges,
          },
        );
        block.items.splice(itemIndex + 1, 0, newItem);
        if (newEdges) {
          newEdges.forEach((edge) => {
            typebot.edges.push(edge);
          });
        }
      }),
    ),
  updateItem: (
    { groupIndex, blockIndex, itemIndex }: ItemIndices,
    updates: Partial<Omit<Item, "id">>,
  ) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[blockIndex];
        if (!blockHasItems(block)) return;
        (typebot.groups[groupIndex].blocks[blockIndex] as BlockWithItems).items[
          itemIndex
        ] = {
          ...block.items[itemIndex],
          ...updates,
        } as Item;
      }),
    ),
  detachItemFromBlock: ({ groupIndex, blockIndex, itemIndex }: ItemIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[
          blockIndex
        ] as BlockWithItems;
        block.items.splice(itemIndex, 1);
      }),
    ),
  deleteItem: ({ groupIndex, blockIndex, itemIndex }: ItemIndices) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[
          blockIndex
        ] as BlockWithItems;
        if (block.items.length === 1) return;
        const removingItem = block.items[itemIndex];
        block.items.splice(itemIndex, 1);
        deleteConnectedEdgesDraft(typebot, removingItem.id);
      }),
    ),
  deleteItemPath: ({
    groupIndex,
    blockIndex,
    itemIndex,
    pathIndex,
  }: ItemIndices & { pathIndex: number }) =>
    setTypebot((typebot) =>
      produce(typebot, (typebot) => {
        const block = typebot.groups[groupIndex].blocks[blockIndex];
        if (!blockHasItems(block)) return;
        const item = (
          typebot.groups[groupIndex].blocks[blockIndex] as BlockWithItems
        ).items[itemIndex];
        if (!itemHasPaths(item)) return;
        const pathId = item.paths?.[pathIndex]?.id;
        deleteConnectedEdgesDraft(typebot, pathId);
        item.paths.splice(pathIndex, 1);
      }),
    ),
});

const createItem = (
  block: Draft<BlockWithCreatableItems>,
  item: NewItem,
  itemIndex: number,
): Item => {
  switch (block.type) {
    case LogicBlockType.CONDITION: {
      const baseItem = item as ConditionItem;
      const newItem = {
        ...baseItem,
        id: "id" in item && item.id ? item.id : createId(),
        content: baseItem.content,
      };
      block.items.splice(itemIndex, 0, newItem);
      return newItem;
    }
    case InputBlockType.CHOICE: {
      const baseItem = item as ButtonItem;
      const newItem = {
        ...baseItem,
        id: "id" in item && item.id ? item.id : createId(),
        content: baseItem.content,
      };
      block.items.splice(itemIndex, 0, newItem);
      return newItem;
    }
    case InputBlockType.PICTURE_CHOICE: {
      const baseItem = item as PictureChoiceItem;
      const newItem = {
        ...baseItem,
        id: "id" in baseItem && item.id ? item.id : createId(),
      };
      block.items.splice(itemIndex, 0, newItem);
      return newItem;
    }
    case InputBlockType.CARDS: {
      const baseItem = item as CardsItem;
      const existingItem =
        block.items?.[itemIndex - 1] ?? block.items?.[itemIndex];
      const newItem = {
        ...baseItem,
        id: "id" in baseItem && item.id ? item.id : createId(),
        imageUrl:
          baseItem.imageUrl ??
          (existingItem?.imageUrl === null ? null : undefined),
        title:
          baseItem.title ?? (existingItem?.title === null ? null : undefined),
        description:
          baseItem.description ??
          (existingItem?.description === null ? null : undefined),
        paths: (baseItem.paths ?? existingItem?.paths ?? [{}]).map((path) => ({
          ...path,
          outgoingEdgeId: undefined,
          id: createId(),
        })),
      };
      block.items.splice(itemIndex, 0, newItem);
      return newItem;
    }
  }
};

export const duplicateItemDraft = (
  item: ItemV6,
  {
    blockId,
    blockType,
    edges,
  }: {
    blockId: string;
    blockType: BlockWithItems["type"];
    edges: Edge[];
  },
): { newItem: Item; newEdges?: Edge[] } => {
  const associatedEdge = item.outgoingEdgeId
    ? edges.find((edge) => edge.id === item.outgoingEdgeId)
    : undefined;
  const newItemId = createId();
  const newDefaultOutgoingEdge = associatedEdge
    ? {
        ...associatedEdge,
        id: createId(),
        from: {
          blockId,
          itemId: newItemId,
        },
      }
    : undefined;
  const newEdges: Edge[] = newDefaultOutgoingEdge
    ? [newDefaultOutgoingEdge]
    : [];
  switch (blockType) {
    case LogicBlockType.CONDITION: {
      const baseItem = item as ConditionItem;
      const newItem = {
        ...baseItem,
        outgoingEdgeId: newDefaultOutgoingEdge?.id,
        id: newItemId,
        content: baseItem.content,
      } satisfies ConditionItem;
      return { newItem, newEdges };
    }
    case InputBlockType.CHOICE: {
      const baseItem = item as ButtonItem;
      const newItem = {
        ...baseItem,
        outgoingEdgeId: newDefaultOutgoingEdge?.id,
        id: newItemId,
        content: baseItem.content,
      } satisfies ButtonItem;
      return { newItem, newEdges };
    }
    case InputBlockType.PICTURE_CHOICE: {
      const baseItem = item as PictureChoiceItem;
      const newItem = {
        ...baseItem,
        outgoingEdgeId: newDefaultOutgoingEdge?.id,
        id: newItemId,
      } satisfies PictureChoiceItem;
      return { newItem, newEdges };
    }
    case InputBlockType.CARDS: {
      const baseItem = item as CardsItem;
      const newPaths = baseItem.paths?.map((path) =>
        duplicatePath(path, { edges, itemId: newItemId, blockId }),
      );
      newPaths?.forEach((path) => {
        if (path.newEdge) newEdges.push(path.newEdge);
      });
      const newItem = {
        ...baseItem,
        id: newItemId,
        outgoingEdgeId: newDefaultOutgoingEdge?.id,
        paths: newPaths?.map((path) => path.newPath),
      } satisfies CardsItem;
      return { newItem, newEdges };
    }
    case LogicBlockType.AB_TEST: {
      const baseItem = item as AbTestBlock["items"][number];
      const newItem = {
        ...baseItem,
        outgoingEdgeId: newDefaultOutgoingEdge?.id,
        id: newItemId,
      } satisfies AbTestBlock["items"][number];
      return { newItem, newEdges };
    }
  }
};

const duplicatePath = (
  path: CardsItemPath,
  {
    blockId,
    itemId,
    edges,
  }: { blockId: string; itemId: string; edges: Edge[] },
): { newPath: CardsItemPath; newEdge?: Edge } => {
  const associatedEdge = path.outgoingEdgeId
    ? edges.find((edge) => edge.id === path.outgoingEdgeId)
    : undefined;
  const newPathId = createId();
  const edgeToCreate = associatedEdge
    ? {
        ...associatedEdge,
        id: createId(),
        from: {
          blockId,
          itemId,
          pathId: newPathId,
        },
      }
    : undefined;
  const newPath = {
    ...path,
    id: newPathId,
    outgoingEdgeId: edgeToCreate?.id,
  };
  return { newPath, newEdge: edgeToCreate };
};
