import { Stack } from '@chakra-ui/react'
import { DropdownList } from 'components/shared/DropdownList'
import { Input } from 'components/shared/Textbox/Input'
import { TableListItemProps } from 'components/shared/TableList'
import { Cell } from 'models'

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
      <DropdownList<string>
        currentItem={item.column}
        onItemSelect={handleColumnSelect}
        items={columns}
        placeholder="Select a column"
      />
      <Input
        defaultValue={item.value ?? ''}
        onChange={handleValueChange}
        placeholder="Type a value..."
      />
    </Stack>
  )
}
