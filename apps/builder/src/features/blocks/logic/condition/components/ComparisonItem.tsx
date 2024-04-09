import { Stack } from '@chakra-ui/react'
import { DropdownList } from '@/components/DropdownList'
import { Comparison, Variable } from '@typebot.io/schemas'
import { TableListItemProps } from '@/components/TableList'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { TextInput } from '@/components/inputs'
import { ComparisonOperators } from '@typebot.io/schemas/features/blocks/logic/condition/constants'
import { useTranslate } from '@tolgee/react'

export const ComparisonItem = ({
  item,
  onItemChange,
}: TableListItemProps<Comparison>) => {
  const { t } = useTranslate()

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
        placeholder={t('variables.search')}
      />
      <DropdownList
        currentItem={item.comparisonOperator}
        onItemSelect={handleSelectComparisonOperator}
        items={Object.values(ComparisonOperators)}
        placeholder={t(
          'blocks.inputs.button.buttonSettings.displayCondition.selectOperator.label'
        )}
      />
      {item.comparisonOperator !== ComparisonOperators.IS_SET &&
        item.comparisonOperator !== ComparisonOperators.IS_EMPTY && (
          <TextInput
            defaultValue={item.value ?? ''}
            onChange={handleChangeValue}
            placeholder={parseValuePlaceholder(item.comparisonOperator)}
          />
        )}
    </Stack>
  )
}

const parseValuePlaceholder = (
  operator: ComparisonOperators | undefined
): string => {
  switch (operator) {
    case ComparisonOperators.NOT_EQUAL:
    case ComparisonOperators.EQUAL:
    case ComparisonOperators.CONTAINS:
    case ComparisonOperators.STARTS_WITH:
    case ComparisonOperators.ENDS_WITH:
    case ComparisonOperators.NOT_CONTAINS:
    case undefined:
      return 'Type a value...'
    case ComparisonOperators.LESS:
    case ComparisonOperators.GREATER:
      return 'Type a number...'
    case ComparisonOperators.IS_SET:
    case ComparisonOperators.IS_EMPTY:
      return ''
    case ComparisonOperators.MATCHES_REGEX:
    case ComparisonOperators.NOT_MATCH_REGEX:
      return '/^[0-9]+$/'
  }
}
