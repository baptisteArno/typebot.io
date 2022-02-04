import { Stack, FormControl, FormLabel } from '@chakra-ui/react'
import { DebouncedInput } from 'components/shared/DebouncedInput'
import { TableListItemProps } from 'components/shared/TableList'
import { VariableSearchInput } from 'components/shared/VariableSearchInput'
import { VariableForTest, Variable } from 'models'

export const VariableForTestInputs = ({
  item,
  onItemChange,
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
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor={'value' + item.id}>Test value:</FormLabel>
        <DebouncedInput
          id={'value' + item.id}
          initialValue={item.value ?? ''}
          onChange={handleValueChange}
        />
      </FormControl>
    </Stack>
  )
}
