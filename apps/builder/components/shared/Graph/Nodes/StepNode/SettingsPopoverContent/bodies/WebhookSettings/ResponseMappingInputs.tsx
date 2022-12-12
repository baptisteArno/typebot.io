import { Stack, FormControl, FormLabel } from '@chakra-ui/react'
import { SearchableDropdown } from 'components/shared/SearchableDropdown'
import { TableListItemProps } from 'components/shared/TableList'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
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
        <FormLabel htmlFor="name">Dado:</FormLabel>
        <SearchableDropdown
          items={dataItems}
          value={item.bodyPath}
          onValueChange={handleBodyPathChange}
          placeholder="Selecione o dado"
          debounceTimeout={debounceTimeout}
          withVariableButton
        />
      </FormControl>
      <FormControl>
        <FormLabel htmlFor="value">Configure sua variável:</FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange}
          placeholder="Pesquise sua variável"
          initialVariableId={item.variableId}
          debounceTimeout={debounceTimeout}
        />
      </FormControl>
    </Stack>
  )
}
