import { ContextMenu } from "@/components/ContextMenu";
import { ConditionContent } from "@/features/blocks/logic/condition/components/ConditionContent";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  type DraggableItem,
  type NodePosition,
  useDragDistance,
} from "@/features/graph/providers/GraphDndProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import type { Coordinates } from "@/features/graph/types";
import { setMultipleRefs } from "@/helpers/setMultipleRefs";
import { Flex, Stack, useColorModeValue } from "@chakra-ui/react";
import type { Item } from "@typebot.io/blocks-core/schemas/items/schema";
import type { ItemIndices } from "@typebot.io/blocks-core/schemas/items/types";
import type { BlockWithItems } from "@typebot.io/blocks-core/schemas/schema";
import { LogicBlockType } from "@typebot.io/blocks-logic/constants";
import { isDefined } from "@typebot.io/lib/utils";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { BlockSourceEndpoint } from "../../endpoints/BlockSourceEndpoint";
import { ItemNodeContent } from "./ItemNodeContent";
import { ItemNodeContextMenu } from "./ItemNodeContextMenu";

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
  const previewingBorderColor = useColorModeValue("blue.400", "blue.300");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bg = useColorModeValue("white", "gray.850");
  const { typebot } = useTypebot();
  const { previewingEdge } = useGraph();
  const { pathname } = useRouter();
  const [isMouseOver, setIsMouseOver] = useState(false);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const isPreviewing =
    previewingEdge &&
    "itemId" in previewingEdge.from &&
    previewingEdge.from.itemId === item.id;
  const isConnectable =
    isDefined(typebot) &&
    !connectionDisabled &&
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

  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <ItemNodeContextMenu indices={indices} />}
    >
      {(ref, isContextMenuOpened) => (
        <Stack
          data-testid="item"
          pos="relative"
          ref={setMultipleRefs([ref, itemRef])}
          w="full"
        >
          {"displayCondition" in item &&
            item.displayCondition?.isEnabled &&
            item.displayCondition.condition && (
              <ConditionContent
                condition={item.displayCondition.condition}
                variables={typebot?.variables ?? []}
                size="xs"
                displaySemicolon
              />
            )}
          <Flex
            align="center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            shadow="sm"
            _hover={{ shadow: "md" }}
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
            <ItemNodeContent
              blockType={block.type}
              item={item}
              isMouseOver={isMouseOver}
              indices={indices}
            />
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
      )}
    </ContextMenu>
  );
};
