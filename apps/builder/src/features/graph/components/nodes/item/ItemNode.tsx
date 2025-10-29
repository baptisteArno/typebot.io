import type {
  Item,
  ItemIndices,
} from "@typebot.io/blocks-core/schemas/items/schema";
import type { BlockWithItems } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { isDefined } from "@typebot.io/lib/utils";
import { ContextMenu } from "@typebot.io/ui/components/ContextMenu";
import { cx } from "@typebot.io/ui/lib/cva";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { ConditionContent } from "@/features/blocks/logic/condition/components/ConditionContent";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  type DraggableItem,
  type NodePosition,
  useDragDistance,
} from "@/features/graph/providers/GraphDndProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import type { Coordinates } from "@/features/graph/types";
import { BlockSourceEndpoint } from "../../endpoints/BlockSourceEndpoint";
import { ItemNodeContent } from "./ItemNodeContent";
import { ItemNodeContextMenuPopup } from "./ItemNodeContextMenuPopup";

type Props = {
  item: Item;
  block: BlockWithItems;
  indices: ItemIndices;
  onMouseDown?: (
    blockNodePosition: { absolute: Coordinates; relative: Coordinates },
    item: DraggableItem,
  ) => void;
  connectionDisabled?: boolean;
};

export const ItemNode = ({
  item,
  block,
  indices,
  onMouseDown,
  connectionDisabled,
}: Props) => {
  const { typebot } = useTypebot();
  const { previewingEdge } = useGraph();
  const { pathname } = useRouter();
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [isContextMenuOpened, setIsContextMenuOpened] = useState(false);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const isPreviewing =
    previewingEdge &&
    "itemId" in previewingEdge.from &&
    previewingEdge.from.itemId === item.id;
  const isConnectable =
    isDefined(typebot) &&
    !connectionDisabled &&
    block.type !== InputBlockType.CARDS &&
    !(
      block.options &&
      "isMultipleChoice" in block.options &&
      block.options.isMultipleChoice
    );
  const onDrag = (position: NodePosition) => {
    if (!onMouseDown || block.type === LogicBlockType.AB_TEST) return;
    onMouseDown(position, { ...item, type: block.type, blockId: block.id });
  };
  useDragDistance({
    ref: itemRef,
    onDrag,
    isDisabled: !onMouseDown,
  });

  const handleMouseEnter = () => setIsMouseOver(true);
  const handleMouseLeave = () => setIsMouseOver(false);

  const groupId = typebot?.groups.at(indices.groupIndex)?.id;

  const displayCondition = getDisplayCondition(item);

  return (
    <ContextMenu.Root onOpenChange={setIsContextMenuOpened}>
      <ContextMenu.Trigger>
        <div
          className="flex flex-col gap-2 relative w-full"
          data-testid="item"
          ref={itemRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {displayCondition && (
            <ConditionContent
              condition={displayCondition}
              variables={typebot?.variables ?? []}
              size="xs"
              displaySemicolon
            />
          )}
          <div
            className={cx(
              "flex items-center rounded-md border w-full transition-all bg-gray-1",
              isContextMenuOpened || isPreviewing
                ? "border-orange-8"
                : undefined,
            )}
          >
            {groupId && (
              <ItemNodeContent
                blockId={block.id}
                groupId={groupId}
                blockType={block.type}
                item={item}
                isMouseOver={isMouseOver}
                indices={indices}
              />
            )}
            {typebot &&
              (isConnectable || pathname.endsWith("analytics")) &&
              groupId && (
                <BlockSourceEndpoint
                  source={{
                    blockId: block.id,
                    itemId: item.id,
                  }}
                  groupId={groupId}
                  className="absolute right-[-49px] bottom-[9px] pointer-events-[all]"
                  isHidden={!isConnectable}
                />
              )}
          </div>
        </div>
      </ContextMenu.Trigger>
      <ItemNodeContextMenuPopup indices={indices} />
    </ContextMenu.Root>
  );
};

const getDisplayCondition = (item: Item) => {
  if (
    "displayCondition" in item &&
    item.displayCondition?.isEnabled &&
    item.displayCondition.condition
  )
    return item.displayCondition.condition;
  if (
    "options" in item &&
    item.options &&
    "displayCondition" in item.options &&
    item.options.displayCondition?.isEnabled &&
    item.options.displayCondition.condition
  )
    return item.options.displayCondition.condition;
  return undefined;
};
