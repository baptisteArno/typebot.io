import { Stack } from '@chakra-ui/react'
import { DropdownList } from '@/components/DropdownList'
import { ExtractingCell, Variable } from 'models'
import { TableListItemProps } from '@/components/TableList'
import { VariableSearchInput } from '@/components/VariableSearchInput'

export const CellWithVariableIdStack = ({
  item,
  onItemChange,
  columns,
}: TableListItemProps<ExtractingCell> & { columns: string[] }) => {
  const handleColumnSelect = (column: string) => {
    if (item.column === column) return
    onItemChange({ ...item, column })
  }

  const handleVariableIdChange = (variable?: Variable) => {
    if (item.variableId === variable?.id) return
    onItemChange({ ...item, variableId: variable?.id })
  }

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <DropdownList<string>
        currentItem={item.column}
        onItemSelect={handleColumnSelect}
        items={columns}
        placeholder="Select a column"
      />
      <VariableSearchInput
        initialVariableId={item.variableId}
        onSelectVariable={handleVariableIdChange}
        placeholder="Select a variable"
      />
    </Stack>
  )
}
