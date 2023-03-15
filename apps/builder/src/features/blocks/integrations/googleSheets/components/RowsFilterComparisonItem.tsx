import { DropdownList } from '@/components/DropdownList'
import { TextInput } from '@/components/inputs'
import { TableListItemProps } from '@/components/TableList'
import { Stack } from '@chakra-ui/react'
import { ComparisonOperators, RowsFilterComparison } from '@typebot.io/schemas'
import React from 'react'

export const RowsFilterComparisonItem = ({
  item,
  columns,
  onItemChange,
}: TableListItemProps<RowsFilterComparison> & { columns: string[] }) => {
  const handleColumnSelect = (column: string) => {
    if (column === item.column) return
    onItemChange({ ...item, column })
  }

  const handleSelectComparisonOperator = (
    comparisonOperator: ComparisonOperators
  ) => {
    if (comparisonOperator === item.comparisonOperator) return
    onItemChange({ ...item, comparisonOperator })
  }

  const handleChangeValue = (value: string) => {
    if (value === item.value) return
    onItemChange({ ...item, value })
  }

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <DropdownList
        currentItem={item.column}
        onItemSelect={handleColumnSelect}
        items={columns}
        placeholder="Select a column"
      />
      <DropdownList
        currentItem={item.comparisonOperator}
        onItemSelect={handleSelectComparisonOperator}
        items={Object.values(ComparisonOperators)}
        placeholder="Select an operator"
      />
      {item.comparisonOperator !== ComparisonOperators.IS_SET && (
        <TextInput
          defaultValue={item.value ?? ''}
          onChange={handleChangeValue}
          placeholder="Type a value..."
        />
      )}
    </Stack>
  )
}
