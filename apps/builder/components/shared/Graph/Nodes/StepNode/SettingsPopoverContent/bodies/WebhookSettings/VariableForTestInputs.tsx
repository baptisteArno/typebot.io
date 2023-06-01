import { Stack, FormControl, FormLabel } from '@chakra-ui/react'
import { TableListItemProps } from 'components/shared/TableList'
import { Input } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
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
        <FormLabel htmlFor={'name' + item.id}>Nome da variável:</FormLabel>
        <VariableSearchInput
          id={'name' + item.id}
          initialVariableId={item.variableId}
          onSelectVariable={handleVariableSelect}
          debounceTimeout={debounceTimeout}
          addVariable={false}
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor={'value' + item.id}>Variável de teste:</FormLabel>
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
