import { DropdownList } from '@/components/DropdownList'
import { TableList } from '@/components/TableList'
import { Flex } from '@chakra-ui/react'
import {
  GoogleSheetsGetOptions,
  RowsFilterComparison,
} from '@sniper.io/schemas'
import React from 'react'
import { RowsFilterComparisonItem } from './RowsFilterComparisonItem'
import { LogicalOperator } from '@sniper.io/schemas/features/blocks/logic/condition/constants'

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

  return (
    <TableList<RowsFilterComparison>
      initialItems={filter?.comparisons ?? []}
      onItemsChange={updateComparisons}
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
    >
      {(props) => <RowsFilterComparisonItem {...props} columns={columns} />}
    </TableList>
  )
}
