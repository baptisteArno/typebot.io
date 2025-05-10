import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import {
  Flex,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Portal,
  Text,
  useEventListener,
} from "@chakra-ui/react";
import type { ItemIndices } from "@typebot.io/blocks-core/schemas/items/schema";
import type { ConditionItem } from "@typebot.io/blocks-logic/condition/schema";
import type { Comparison, Condition } from "@typebot.io/conditions/schemas";
import { isNotDefined } from "@typebot.io/lib/utils";
import type React from "react";
import { useRef } from "react";
import { ConditionContent } from "./ConditionContent";
import { ConditionForm } from "./ConditionForm";

type Props = {
  item: ConditionItem;
  indices: ItemIndices;
};

export const ConditionItemNode = ({ item, indices }: Props) => {
  const { typebot, updateItem } = useTypebot();
  const { openedNodeId, setOpenedNodeId } = useGraph();
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation();

  const openPopover = () => {
    setOpenedNodeId(item.id);
  };

  const updateCondition = (condition: Condition) => {
    updateItem(indices, { ...item, content: condition } as ConditionItem);
  };

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation();
  };
  useEventListener("wheel", handleMouseWheel, ref.current);

  return (
    <Popover
      placement="left"
      isLazy
      isOpen={openedNodeId === item.id}
      closeOnBlur={false}
    >
      <PopoverAnchor>
        <Flex
          p={3}
          pos="relative"
          maxW="full"
          overflow="hidden"
          onClick={openPopover}
        >
          {item.content?.comparisons?.length === 0 ||
          comparisonIsEmpty(item.content?.comparisons?.at(0)) ? (
            <Text color={"gray.500"}>Configure...</Text>
          ) : (
            <ConditionContent
              condition={item.content}
              variables={typebot?.variables ?? []}
            />
          )}
        </Flex>
      </PopoverAnchor>
      <Portal>
        <PopoverContent pos="relative" onMouseDown={handleMouseDown}>
          <PopoverArrow />
          <PopoverBody
            py="6"
            overflowY="auto"
            maxH="400px"
            shadow="md"
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
