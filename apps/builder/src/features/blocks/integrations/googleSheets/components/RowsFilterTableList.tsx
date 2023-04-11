import { DropdownList } from '@/components/DropdownList'
import { TableList, TableListItemProps } from '@/components/TableList'
import { Flex } from '@chakra-ui/react'
import {
  GoogleSheetsGetOptions,
  LogicalOperator,
  RowsFilterComparison,
} from '@typebot.io/schemas'
import React, { useCallback } from 'react'
import { RowsFilterComparisonItem } from './RowsFilterComparisonItem'

type Props = {
  filter: GoogleSheetsGetOptions['filter']
  columns: string[]
  onFilterChange: (filter: GoogleSheetsGetOptions['filter']) => void
}

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
    })

  const updateLogicalOperator = (logicalOperator: LogicalOperator) =>
    filter && onFilterChange({ ...filter, logicalOperator })

  const createRowsFilterComparisonItem = useCallback(
    (props: TableListItemProps<RowsFilterComparison>) => (
      <RowsFilterComparisonItem {...props} columns={columns} />
    ),
    [columns]
  )

  return (
    <TableList<RowsFilterComparison>
      initialItems={filter?.comparisons ?? []}
      onItemsChange={updateComparisons}
      Item={createRowsFilterComparisonItem}
      ComponentBetweenItems={() => (
        <Flex justify="center">
          <DropdownList
            currentItem={filter?.logicalOperator}
            onItemSelect={updateLogicalOperator}
            items={Object.values(LogicalOperator)}
          />
        </Flex>
      )}
      addLabel="Add filter rule"
    />
  )
}
