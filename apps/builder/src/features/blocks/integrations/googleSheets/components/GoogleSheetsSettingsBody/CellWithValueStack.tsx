import { Stack } from '@chakra-ui/react'
import { DropdownList } from '@/components/DropdownList'
import { Cell } from '@typebot.io/schemas'
import { TableListItemProps } from '@/components/TableList'
import { TextInput } from '@/components/inputs'

export const CellWithValueStack = ({
  item,
  onItemChange,
  columns,
}: TableListItemProps<Cell> & { columns: string[] }) => {
  const handleColumnSelect = (column: string) => {
    if (item.column === column) return
    onItemChange({ ...item, column })
  }
  const handleValueChange = (value: string) => {
    if (item.value === value) return
    onItemChange({ ...item, value })
  }
  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px" w="full">
      <DropdownList
        currentItem={item.column}
        onItemSelect={handleColumnSelect}
        items={columns}
        placeholder="Select a column"
      />
      <TextInput
        defaultValue={item.value ?? ''}
        onChange={handleValueChange}
        placeholder="Type a value..."
      />
    </Stack>
  )
}
