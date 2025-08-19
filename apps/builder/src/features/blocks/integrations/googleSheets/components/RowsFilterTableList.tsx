import { TableList } from "@/components/TableList";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { Flex } from "@chakra-ui/react";
import type {
  GoogleSheetsGetOptions,
  RowsFilterComparison,
} from "@typebot.io/blocks-integrations/googleSheets/schema";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import React from "react";
import { RowsFilterComparisonItem } from "./RowsFilterComparisonItem";

type Props = {
  filter: GoogleSheetsGetOptions["filter"];
  columns: string[];
  onFilterChange: (filter: GoogleSheetsGetOptions["filter"]) => void;
};

export const RowsFilterTableList = ({
  filter,
  columns,
  onFilterChange,
}: Props) => {
  const updateComparisons = (comparisons: RowsFilterComparison[]) =>
    onFilterChange({
      ...filter,
      logicalOperator: filter?.logicalOperator ?? LogicalOperator.AND,
      comparisons,
    });

  const updateLogicalOperator = (logicalOperator: LogicalOperator) =>
    filter && onFilterChange({ ...filter, logicalOperator });

  return (
    <TableList<RowsFilterComparison>
      initialItems={filter?.comparisons ?? []}
      onItemsChange={updateComparisons}
      ComponentBetweenItems={() => (
        <Flex justify="center">
          <BasicSelect
            value={filter?.logicalOperator}
            onChange={updateLogicalOperator}
            items={Object.values(LogicalOperator)}
          />
        </Flex>
      )}
      addLabel="Add filter rule"
    >
      {(props) => <RowsFilterComparisonItem {...props} columns={columns} />}
    </TableList>
  );
};
