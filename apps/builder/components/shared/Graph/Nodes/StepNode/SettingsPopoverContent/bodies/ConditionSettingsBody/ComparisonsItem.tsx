import { Stack, IconButton, Fade } from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import { DropdownList } from 'components/shared/DropdownList'
import { Input } from 'components/shared/Textbox/Input'
import { TableListItemProps } from 'components/shared/TableList'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { Comparison, Variable, ComparisonOperators } from 'models'
import { useTypebot } from 'contexts/TypebotContext'
import { useEffect, useState } from 'react'


export const ComparisonItem = ({
  item,
  onItemChange,
  onRemoveItem
}: TableListItemProps<Comparison>) => {
  const { typebot } = useTypebot()
  let myVariable = typebot?.variables?.find((v: Variable) => v.id === item?.variableId)
  let myComparisonOperator = item?.comparisonOperator

  const [needSecondaryValue, setNeedSecondaryValue] = useState<boolean>(!!item.secondaryValue)
  const [needValue, setNeedValue] = useState<boolean>(true)

  const handleSelectVariable = (variable?: Variable) => {
    if (variable?.id === item.variableId) return
    myVariable = variable
    onItemChange({ ...item, variableId: variable?.id })
  }

  const handleSelectComparisonOperator = (
    comparisonOperator: ComparisonOperators
  ) => {
    const indexOf = Object.values(ComparisonOperators).indexOf(comparisonOperator)
    const val = Object.keys(ComparisonOperators)[indexOf]

    if (val === item.comparisonOperator) return
    myComparisonOperator = comparisonOperator
    onItemChange({ ...item, comparisonOperator: val as ComparisonOperators })
  }
  const handleChangeValue = (value: string) => {
    if (value === item.value) return
    onItemChange({ ...item, value })
  }

  const handleChangeSecondaryValue = (value: string) => {
    if (value === item.secondaryValue) return
    onItemChange({ ...item, secondaryValue: value })
  }

  const showCorrectInput = (value: ComparisonOperators | undefined) => {
    if (!value) return

    const indexOf = Object.keys(ComparisonOperators).indexOf(value)
    return Object.values(ComparisonOperators)[indexOf]
  }

  const resolveOperators = () => {
    const allTypesArray = [
      ComparisonOperators.EQUAL,
      ComparisonOperators.NOT_EQUAL,
      ComparisonOperators.EMPTY,
      ComparisonOperators.NOT_EMPTY
    ]

    const stringArray = [
      ComparisonOperators.START_WITH,
      ComparisonOperators.NOT_START_WITH,
      ComparisonOperators.END_WITH,
      ComparisonOperators.NOT_END_WITH,
      ComparisonOperators.CONTAINS,
      ComparisonOperators.NOT_CONTAINS
    ]

    const numberArray = [
      ComparisonOperators.GREATER,
      ComparisonOperators.GREATER_OR_EQUAL,
      ComparisonOperators.LESS,
      ComparisonOperators.LESS_OR_EQUAL,
      ComparisonOperators.BETWEEN,
      ComparisonOperators.NOT_BETWEEN
    ]

    if (!myVariable || (myVariable?.type || '') === '') return allTypesArray

    if (['string', 'order'].includes(myVariable.type || '')) return [...allTypesArray, ...stringArray]
    if (['float', 'number', 'date'].includes(myVariable.type || '')) return [...allTypesArray, ...numberArray]

    return allTypesArray
  }

  const handleDeleteClick = () => {
    onRemoveItem({ ...item });
  }

  useEffect(() => {
    const index = Object.keys(ComparisonOperators).indexOf(myComparisonOperator || ComparisonOperators.EQUAL)
    const myValue = Object.values(ComparisonOperators)[index]
    setNeedSecondaryValue([ComparisonOperators.BETWEEN, ComparisonOperators.NOT_BETWEEN].includes(myValue))
    setNeedValue(![ComparisonOperators.EMPTY, ComparisonOperators.NOT_EMPTY].includes(myValue))
  }, [myComparisonOperator]
  )

  useEffect(() => {
    if (needValue) return
    onItemChange({ ...item, value: undefined })
  }, [needValue])

  useEffect(() => {
    if (needSecondaryValue) return
    onItemChange({ ...item, secondaryValue: undefined })
  }, [needSecondaryValue])

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <VariableSearchInput
        initialVariableId={item.variableId}
        onSelectVariable={handleSelectVariable}
        placeholder="Pesquise sua variável"
      />
      <DropdownList<ComparisonOperators>
        currentItem={showCorrectInput(item.comparisonOperator)}
        onItemSelect={handleSelectComparisonOperator}
        items={resolveOperators()}
        placeholder="Selecione um operador"
      />
      {needValue && (
        <Input
          defaultValue={item.value ?? ''}
          onChange={handleChangeValue}
          placeholder="Digite um valor..."
        />
      )}
      {needSecondaryValue && (
        <div>
          <span> E </span>
          <Input
            defaultValue={item.secondaryValue ?? ''}
            onChange={handleChangeSecondaryValue}
            placeholder="Digite um valor..."
          />
        </div>
      )}
      <IconButton
        aria-label="Delete item"
        icon={<TrashIcon />}
        size="xs"
        shadow="md"
        colorScheme="gray"
        onClick={handleDeleteClick}
      />
    </Stack>
  )
}
