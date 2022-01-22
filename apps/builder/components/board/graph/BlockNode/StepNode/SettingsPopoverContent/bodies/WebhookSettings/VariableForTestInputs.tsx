import { Stack, FormControl, FormLabel } from '@chakra-ui/react'
import { DebouncedInput } from 'components/shared/DebouncedInput'
import { TableListItemProps } from 'components/shared/TableList'
import { VariableSearchInput } from 'components/shared/VariableSearchInput'
import { VariableForTest, Variable } from 'models'

export const VariableForTestInputs = ({
  id,
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
        <FormLabel htmlFor={'name' + id}>Variable name:</FormLabel>
        <VariableSearchInput
          id={'name' + id}
          initialVariableId={item.variableId}
          onSelectVariable={handleVariableSelect}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor={'value' + id}>Test value:</FormLabel>
        <DebouncedInput
          id={'value' + id}
          delay={100}
          initialValue={item.value ?? ''}
          onChange={handleValueChange}
        />
      </FormControl>
    </Stack>
  )
}
