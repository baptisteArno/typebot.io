import { ConditionContent } from "@/features/blocks/logic/condition/components/ConditionContent";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  type DraggableItem,
  type NodePosition,
  useDragDistance,
} from "@/features/graph/providers/GraphDndProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import type { Coordinates } from "@/features/graph/types";
import { Flex, Stack, useColorModeValue } from "@chakra-ui/react";
import type {
  Item,
  ItemIndices,
} from "@typebot.io/blocks-core/schemas/items/schema";
import type { BlockWithItems } from "@typebot.io/blocks-core/schemas/schema";
import { InputBlockType } from "@typebot.io/blocks-inputs/constants";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { isDefined } from "@typebot.io/lib/utils";
import { ContextMenu } from "@typebot.io/ui/components/ContextMenu";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
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
  const previewingBorderColor = useColorModeValue("orange.400", "orange.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bg = useColorModeValue("white", "gray.900");
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
        <Stack
          data-testid="item"
          pos="relative"
          ref={itemRef}
          w="full"
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
          <Flex
            align="center"
            transition="box-shadow 200ms, border-color 200ms"
            rounded="md"
            bg={bg}
            borderWidth={1}
            borderColor={
              isContextMenuOpened || isPreviewing
                ? previewingBorderColor
                : borderColor
            }
            w="full"
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
                  pos="absolute"
                  right="-49px"
                  bottom="9px"
                  pointerEvents="all"
                  isHidden={!isConnectable}
                />
              )}
          </Flex>
        </Stack>
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
