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
  const handleValueChange = (value: string) => {
    console.log('handleValueChange', { value, item })
    if (value === item.value) return
    onItemChange({ ...item, value })
  }
  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <FormControl>
        <FormLabel htmlFor={'name' + item.id}>Nome da variável: {item.token}</FormLabel>
      </FormControl>
      <FormControl>
        <FormLabel htmlFor={'value' + item.id}>Valor de teste:</FormLabel>
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
