import { HStack, Text } from '@chakra-ui/react'
import { DropdownList } from '@/components/DropdownList'
import { TableListItemProps } from '@/components/TableList'
import { TextInput } from '@/components/inputs'
import { WhatsAppComparison } from '@typebot.io/schemas/features/whatsapp'
import { ComparisonOperators } from '@typebot.io/schemas/features/blocks/logic/condition/constants'

export const WhatsAppComparisonItem = ({
  item,
  onItemChange,
}: TableListItemProps<WhatsAppComparison>) => {
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
    <HStack p="4" rounded="md" flex="1" borderWidth="1px">
      <Text flexShrink={0}>User message</Text>
      <DropdownList
        currentItem={item.comparisonOperator}
        onItemSelect={handleSelectComparisonOperator}
        items={Object.values(ComparisonOperators)}
        placeholder="Select an operator"
        size="sm"
        flexShrink={0}
      />
      {item.comparisonOperator !== ComparisonOperators.IS_SET &&
        item.comparisonOperator !== ComparisonOperators.IS_EMPTY && (
          <TextInput
            defaultValue={item.value ?? ''}
            onChange={handleChangeValue}
            placeholder={parseValuePlaceholder(item.comparisonOperator)}
            withVariableButton={false}
            size="sm"
          />
        )}
    </HStack>
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
      return '^[0-9]+$'
  }
}
