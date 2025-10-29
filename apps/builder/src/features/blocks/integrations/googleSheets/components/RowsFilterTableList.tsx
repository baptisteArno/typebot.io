import type {
  GoogleSheetsGetOptions,
  RowsFilterComparison,
} from "@typebot.io/blocks-integrations/googleSheets/schema";
import { LogicalOperator } from "@typebot.io/conditions/constants";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { TableList } from "@/components/TableList";
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

  const updateLogicalOperator = (
    logicalOperator: LogicalOperator | undefined,
  ) => filter && onFilterChange({ ...filter, logicalOperator });

  return (
    <TableList<RowsFilterComparison>
      initialItems={filter?.comparisons ?? []}
      onItemsChange={updateComparisons}
      ComponentBetweenItems={() => (
        <div className="flex justify-center">
          <BasicSelect
            value={filter?.logicalOperator}
            onChange={updateLogicalOperator}
            items={Object.values(LogicalOperator)}
          />
        </div>
      )}
      addLabel="Add filter rule"
    >
      {(props) => <RowsFilterComparisonItem {...props} columns={columns} />}
    </TableList>
  );
};
