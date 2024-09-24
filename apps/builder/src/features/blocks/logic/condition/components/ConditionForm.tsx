import { DropdownList } from "@/components/DropdownList";
import { TableList } from "@/components/TableList";
import { Flex } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultConditionItemContent } from "@typebot.io/blocks-logic/condition/constants";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import type { Comparison, Condition } from "@typebot.io/conditions/schemas";
import React from "react";
import { ComparisonItem } from "./ComparisonItem";

type Props = {
  condition: Condition | undefined;
  onConditionChange: (newCondition: Condition) => void;
};

export const ConditionForm = ({ condition, onConditionChange }: Props) => {
  const { t } = useTranslate();
  const handleComparisonsChange = (comparisons: Comparison[]) =>
    onConditionChange({ ...condition, comparisons });
  const handleLogicalOperatorChange = (logicalOperator: LogicalOperator) =>
    onConditionChange({ ...condition, logicalOperator });

  return (
    <TableList<Comparison>
      initialItems={condition?.comparisons}
      onItemsChange={handleComparisonsChange}
      ComponentBetweenItems={() => (
        <Flex justify="center">
          <DropdownList
            currentItem={
              condition?.logicalOperator ??
              defaultConditionItemContent.logicalOperator
            }
            onItemSelect={handleLogicalOperatorChange}
            items={Object.values(LogicalOperator)}
          />
        </Flex>
      )}
      addLabel={t(
        "blocks.inputs.button.buttonSettings.addComparisonButton.label",
      )}
    >
      {(props) => <ComparisonItem {...props} />}
    </TableList>
  );
};
