import { useTranslate } from "@tolgee/react";
import { shouldOpenItemSettingsOnCreation } from "@typebot.io/blocks-core/helpers";
import type {
  BlockIndices,
  BlockWithItems,
} from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { isDefined } from "@typebot.io/lib/utils";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Portal } from "@/components/Portal";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  computeNearestPlaceholderIndex,
  type DraggableItem,
  useBlockDnd,
} from "@/features/graph/providers/GraphDndProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import type { Coordinates } from "@/features/graph/types";
import { useEventListener } from "@/hooks/useEventListener";
import { BlockSourceEndpoint } from "../../endpoints/BlockSourceEndpoint";
import { PlaceholderNode } from "../PlaceholderNode";
import { getItemName } from "./getItemName";
import { ItemNode } from "./ItemNode";

type Props = {
  block: BlockWithItems;
  indices: BlockIndices;
};

export const ItemNodesList = ({
  block,
  indices: { groupIndex, blockIndex },
}: Props) => {
  const { typebot, createItem, detachItemFromBlock } = useTypebot();
  const { draggedItem, setDraggedItem, mouseOverBlock } = useBlockDnd();
  const placeholderRefs = useRef<HTMLDivElement[]>([]);
  const { graphPosition, setOpenedNodeId } = useGraph();
  const isDraggingOnCurrentBlock =
    (draggedItem && mouseOverBlock?.id === block.id) ?? false;
  const showPlaceholders =
    draggedItem !== undefined && block.type === draggedItem.type;

  const isLastBlock =
    isDefined(typebot) &&
    typebot.groups.at(groupIndex)?.blocks?.at(blockIndex + 1) === undefined;

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });
  const [relativeCoordinates, setRelativeCoordinates] = useState({
    x: 0,
    y: 0,
  });
  const [expandedPlaceholderIndex, setExpandedPlaceholderIndex] = useState<
    number | undefined
  >();

  const handleGlobalMouseMove = (event: MouseEvent) => {
    if (!draggedItem) return;
    const { clientX, clientY } = event;
    setPosition({
      ...position,
      x: clientX - relativeCoordinates.x,
      y: clientY - relativeCoordinates.y,
    });
  };
  useEventListener("mousemove", handleGlobalMouseMove);

  useEffect(() => {
    if (!showPlaceholders) return;
    if (mouseOverBlock?.id !== block.id) {
      setExpandedPlaceholderIndex(undefined);
    }
  }, [block.id, mouseOverBlock?.id, showPlaceholders]);

  const handleMouseMoveOnBlock = (event: MouseEvent) => {
    if (!isDraggingOnCurrentBlock || !showPlaceholders) return;
    const index = computeNearestPlaceholderIndex(event.pageY, placeholderRefs);
    setExpandedPlaceholderIndex(index);
  };
  useEventListener("mousemove", handleMouseMoveOnBlock, mouseOverBlock?.ref);

  const handleMouseUpOnGroup = (e: MouseEvent) => {
    if (
      !showPlaceholders ||
      !isDraggingOnCurrentBlock ||
      !draggedItem ||
      mouseOverBlock?.id !== block.id
    )
      return;
    setExpandedPlaceholderIndex(undefined);
    const itemIndex = computeNearestPlaceholderIndex(e.pageY, placeholderRefs);
    e.stopPropagation();
    setDraggedItem(undefined);
    createItem(draggedItem, {
      groupIndex,
      blockIndex,
      itemIndex,
    });
  };
  useEventListener("mouseup", handleMouseUpOnGroup, mouseOverBlock?.ref, {
    capture: true,
  });

  const handleBlockMouseDown =
    (itemIndex: number) =>
    (
      { absolute, relative }: { absolute: Coordinates; relative: Coordinates },
      item: DraggableItem,
    ) => {
      if (!typebot || block.items.length <= 1) return;
      placeholderRefs.current.splice(itemIndex + 1, 1);
      detachItemFromBlock({ groupIndex, blockIndex, itemIndex });
      setPosition(absolute);
      setRelativeCoordinates(relative);
      setDraggedItem({
        ...item,
      });
    };

  const stopPropagating = (e: React.MouseEvent) => e.stopPropagation();

  const handlePushElementRef =
    (idx: number) => (elem: HTMLDivElement | null) => {
      elem && (placeholderRefs.current[idx] = elem);
    };

  const groupId = typebot?.groups.at(groupIndex)?.id;

  const itemName = getItemName(block.type);

  const insertItem = (itemIndex: number) => {
    const newItemId = createItem({}, { groupIndex, blockIndex, itemIndex });
    if (newItemId && shouldOpenItemSettingsOnCreation(block.type))
      setOpenedNodeId(newItemId);
  };

  return (
    <div
      className="flex flex-col gap-0 max-w-full flex-1"
      onClick={stopPropagating}
    >
      <PlaceholderNode
        isVisible={showPlaceholders}
        isExpanded={expandedPlaceholderIndex === 0}
        ref={handlePushElementRef(0)}
        onClick={() => insertItem(0)}
        initialHeightPixels={5}
      >
        Add {itemName}
      </PlaceholderNode>
      {block.items.map((item, idx) => (
        <div className="flex flex-col gap-0" key={item.id}>
          <ItemNode
            item={item}
            block={block}
            indices={{ groupIndex, blockIndex, itemIndex: idx }}
            onMouseDown={handleBlockMouseDown(idx)}
          />
          <PlaceholderNode
            isVisible={showPlaceholders}
            isExpanded={expandedPlaceholderIndex === idx + 1}
            ref={handlePushElementRef(idx + 1)}
            onClick={() => insertItem(idx + 1)}
          >
            Add {itemName}
          </PlaceholderNode>
        </div>
      ))}
      {checkIfDefaultItemIsNeeded(block, isLastBlock) && groupId && (
        <DefaultItemNode block={block} groupId={groupId} />
      )}
      {draggedItem && draggedItem.blockId === block.id && (
        <Portal>
          <div
            className="flex fixed w-[220px] pointer-events-none top-0 left-0 origin-[0_0_0]"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg) scale(${graphPosition.scale})`,
            }}
          >
            <ItemNode
              item={draggedItem}
              block={block}
              indices={{ groupIndex, blockIndex, itemIndex: 0 }}
              connectionDisabled
            />
          </div>
        </Portal>
      )}
    </div>
  );
};

const DefaultItemNode = ({
  block,
  groupId,
}: {
  block: BlockWithItems;
  groupId: string;
}) => {
  const { t } = useTranslate();

  return (
    <div className="flex px-4 py-2 border rounded-md relative items-center bg-gray-1 cursor-not-allowed">
      <p color="gray.500">
        {block.type === LogicBlockType.CONDITION
          ? t("blocks.inputs.button.else.label")
          : t("blocks.inputs.button.default.label")}
      </p>
      <BlockSourceEndpoint
        source={{
          blockId: block.id,
        }}
        groupId={groupId}
        className="absolute right-[-49px]"
      />
    </div>
  );
};

const checkIfDefaultItemIsNeeded = (
  block: BlockWithItems,
  isLastBlock: boolean,
) => {
  if (!isLastBlock) return false;
  if (block.outgoingEdgeId || block.type === LogicBlockType.CONDITION)
    return true;
  if (block.items.length === 1) return false;
  if (block.type === InputBlockType.CARDS) {
    return block.items.some((item) =>
      item.paths?.some((path) => path.outgoingEdgeId === undefined),
    );
  }
  if (
    block.type === InputBlockType.CHOICE ||
    block.type === InputBlockType.PICTURE_CHOICE
  )
    return block.items.some((item) => item.outgoingEdgeId === undefined);
  return true;
};
