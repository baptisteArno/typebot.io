import { Stack } from '@chakra-ui/react'
import { DropdownList } from 'components/shared/DropdownList'
import { Input } from 'components/shared/Textbox/Input'
import { TableListItemProps } from 'components/shared/TableList'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { Comparison, Variable, ComparisonOperators } from 'models'

export const ComparisonItem = ({
  item,
  onItemChange,
}: TableListItemProps<Comparison>) => {
  const handleSelectVariable = (variable?: Variable) => {
    if (variable?.id === item.variableId) return
    onItemChange({ ...item, variableId: variable?.id })
  }

  const handleSelectComparisonOperator = (
    comparisonOperator: ComparisonOperators
  ) => {
    if (comparisonOperator === item.comparisonOperator) return
    onItemChange({ ...item, comparisonOperator })
  }
  const handleChangeValue = (value: string) => {
    if (value === item.value) return
    onItemChange({ ...item, value })
  }

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <VariableSearchInput
        initialVariableId={item.variableId}
        onSelectVariable={handleSelectVariable}
        placeholder="Pesquise sua variável"
      />
      <DropdownList<ComparisonOperators>
        currentItem={item.comparisonOperator}
        onItemSelect={handleSelectComparisonOperator}
        items={Object.values(ComparisonOperators)}
        placeholder="Selecione um operador"
      />
      {item.comparisonOperator !== ComparisonOperators.IS_SET && (
        <Input
          defaultValue={item.value ?? ''}
          onChange={handleChangeValue}
          placeholder="Digite um valor..."
        />
      )}
    </Stack>
  )
}
