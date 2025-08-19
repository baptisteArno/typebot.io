import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { useGraph } from "@/features/graph/providers/GraphProvider";
import { Flex, Text, useEventListener } from "@chakra-ui/react";
import type { ItemIndices } from "@typebot.io/blocks-core/schemas/items/schema";
import type { ConditionItem } from "@typebot.io/blocks-logic/condition/schema";
import type { Comparison, Condition } from "@typebot.io/conditions/schemas";
import { isNotDefined } from "@typebot.io/lib/utils";
import { Popover } from "@typebot.io/ui/components/Popover";
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
  const ref = useRef<HTMLDivElement | null>(null);
  const { openedNodeId, setOpenedNodeId } = useGraph();

  const updateCondition = (condition: Condition) => {
    updateItem(indices, { ...item, content: condition } as ConditionItem);
  };

  const handleMouseWheel = (e: WheelEvent) => {
    e.stopPropagation();
  };
  useEventListener("wheel", handleMouseWheel, ref.current);

  return (
    <Popover.Root
      isOpen={openedNodeId === item.id}
      onOpen={() => setOpenedNodeId(item.id)}
      onClose={() => setOpenedNodeId(undefined)}
    >
      <Popover.Trigger>
        <Flex p={3} pos="relative" maxW="full" overflow="hidden">
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
      </Popover.Trigger>
      <Popover.Popup side="right" className="p-4">
        <ConditionForm
          condition={item.content}
          onConditionChange={updateCondition}
        />
      </Popover.Popup>
    </Popover.Root>
  );
};

const comparisonIsEmpty = (comparison?: Comparison) =>
  isNotDefined(comparison?.comparisonOperator) &&
  isNotDefined(comparison?.value) &&
  isNotDefined(comparison?.variableId);
