import { PlusIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import {
  Fade,
  Flex,
  IconButton,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Portal,
  Text,
  useEventListener,
} from "@chakra-ui/react";
import { createId } from "@paralleldrive/cuid2";
import type { ItemIndices } from "@typebot.io/blocks-core/schemas/items/types";
import type { ConditionItem } from "@typebot.io/blocks-logic/condition/schema";
import type { Comparison, Condition } from "@typebot.io/conditions/schemas";
import { isNotDefined } from "@typebot.io/lib/utils";
import type React from "react";
import { useRef } from "react";
import { ConditionContent } from "./ConditionContent";
import { ConditionForm } from "./ConditionForm";

type Props = {
  item: ConditionItem;
  isMouseOver: boolean;
  indices: ItemIndices;
};

export const ConditionItemNode = ({ item, isMouseOver, indices }: Props) => {
  const { typebot, createItem, updateItem } = useTypebot();
  const { openedItemId, setOpenedItemId } = useGraph();
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation();

  const openPopover = () => {
    setOpenedItemId(item.id);
  };

  const updateCondition = (condition: Condition) => {
    updateItem(indices, { ...item, content: condition } as ConditionItem);
  };

  const handlePlusClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const itemIndex = indices.itemIndex + 1;
    const newItemId = createId();
    createItem(
      {
        id: newItemId,
      },
      { ...indices, itemIndex },
    );
    setOpenedItemId(newItemId);
  };

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation();
  };
  useEventListener("wheel", handleMouseWheel, ref.current);

  return (
    <Popover
      placement="left"
      isLazy
      isOpen={openedItemId === item.id}
      closeOnBlur={false}
    >
      <PopoverAnchor>
        <Flex p={3} pos="relative" w="full" onClick={openPopover}>
          {item.content?.comparisons?.length === 0 ||
          comparisonIsEmpty(item.content?.comparisons?.at(0)) ? (
            <Text color={"gray.500"}>Configure...</Text>
          ) : (
            <ConditionContent
              condition={item.content}
              variables={typebot?.variables ?? []}
            />
          )}
          <Fade
            in={isMouseOver}
            style={{
              position: "absolute",
              bottom: "-15px",
              zIndex: 3,
              left: "90px",
            }}
            unmountOnExit
          >
            <IconButton
              aria-label="Add item"
              icon={<PlusIcon />}
              size="xs"
              shadow="md"
              colorScheme="gray"
              onClick={handlePlusClick}
            />
          </Fade>
        </Flex>
      </PopoverAnchor>
      <Portal>
        <PopoverContent pos="relative" onMouseDown={handleMouseDown}>
          <PopoverArrow />
          <PopoverBody
            py="6"
            overflowY="auto"
            maxH="400px"
            shadow="lg"
            ref={ref}
          >
            <ConditionForm
              condition={item.content}
              onConditionChange={updateCondition}
            />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
};

const comparisonIsEmpty = (comparison?: Comparison) =>
  isNotDefined(comparison?.comparisonOperator) &&
  isNotDefined(comparison?.value) &&
  isNotDefined(comparison?.variableId);
