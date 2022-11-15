import { SearchableDropdown } from '@/components/SearchableDropdown'
import { TableListItemProps } from '@/components/TableList'
import { VariableSearchInput } from '@/components/VariableSearchInput'
import { Stack, FormControl, FormLabel } from '@chakra-ui/react'
import { Variable, ResponseVariableMapping } from 'models'

export const DataVariableInputs = ({
  item,
  onItemChange,
  dataItems,
  debounceTimeout,
}: TableListItemProps<ResponseVariableMapping> & { dataItems: string[] }) => {
  const handleBodyPathChange = (bodyPath: string) =>
    onItemChange({ ...item, bodyPath })
  const handleVariableChange = (variable?: Variable) =>
    onItemChange({ ...item, variableId: variable?.id })

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <FormControl>
        <FormLabel htmlFor="name">Data:</FormLabel>
        <SearchableDropdown
          items={dataItems}
          value={item.bodyPath}
          onValueChange={handleBodyPathChange}
          placeholder="Select the data"
          debounceTimeout={debounceTimeout}
          withVariableButton
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="value">Set variable:</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange}
          placeholder="Search for a variable"
          initialVariableId={item.variableId}
          debounceTimeout={debounceTimeout}
        />
      </FormControl>
    </Stack>
  )
}
