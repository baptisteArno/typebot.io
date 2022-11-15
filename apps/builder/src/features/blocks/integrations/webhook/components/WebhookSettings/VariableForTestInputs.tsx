import { Input } from '@/components/inputs'
import { TableListItemProps } from '@/components/TableList'
import { VariableSearchInput } from '@/components/VariableSearchInput'
import { Stack, FormControl, FormLabel } from '@chakra-ui/react'
import { VariableForTest, Variable } from 'models'

export const VariableForTestInputs = ({
  item,
  onItemChange,
  debounceTimeout,
}: TableListItemProps<VariableForTest>) => {
  const handleVariableSelect = (variable?: Variable) =>
    onItemChange({ ...item, variableId: variable?.id })
  const handleValueChange = (value: string) => {
    if (value === item.value) return
    onItemChange({ ...item, value })
  }
  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <FormControl>
        <FormLabel htmlFor={'name' + item.id}>Variable name:</FormLabel>
        <VariableSearchInput
          id={'name' + item.id}
          initialVariableId={item.variableId}
          onSelectVariable={handleVariableSelect}
          debounceTimeout={debounceTimeout}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor={'value' + item.id}>Test value:</FormLabel>
        <Input
          id={'value' + item.id}
          defaultValue={item.value ?? ''}
          onChange={handleValueChange}
          debounceTimeout={debounceTimeout}
        />
      </FormControl>
    </Stack>
  )
}
