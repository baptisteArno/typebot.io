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
  filter: NonNullable<GoogleSheetsGetOptions['filter']>
  columns: string[]
  onFilterChange: (
    filter: NonNullable<GoogleSheetsGetOptions['filter']>
  ) => void
}

export const RowsFilterTableList = ({
  filter,
  columns,
  onFilterChange,
}: Props) => {
  const handleComparisonsChange = (comparisons: RowsFilterComparison[]) =>
    onFilterChange({ ...filter, comparisons })

  const handleLogicalOperatorChange = (logicalOperator: LogicalOperator) =>
    onFilterChange({ ...filter, logicalOperator })

  const createRowsFilterComparisonItem = useCallback(
    (props: TableListItemProps<RowsFilterComparison>) => (
      <RowsFilterComparisonItem {...props} columns={columns} />
    ),
    [columns]
  )

  return (
    <TableList<RowsFilterComparison>
      initialItems={filter?.comparisons}
      onItemsChange={handleComparisonsChange}
      Item={createRowsFilterComparisonItem}
      ComponentBetweenItems={() => (
        <Flex justify="center">
          <DropdownList
            currentItem={filter?.logicalOperator}
            onItemSelect={handleLogicalOperatorChange}
            items={Object.values(LogicalOperator)}
          />
        </Flex>
      )}
      addLabel="Add filter rule"
    />
  )
}
