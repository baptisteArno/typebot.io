import { DropdownList } from '@/components/DropdownList'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { TableListItemProps } from '@/components/TableList'
import { Stack } from '@chakra-ui/react'
import { Variable, ZemanticAiBlock } from '@typebot.io/schemas'
import {
  defaultZemanticAiResponseMappingItem,
  searchResponseValues,
} from '@typebot.io/schemas/features/blocks/integrations/zemanticAi/constants'

type Props = TableListItemProps<
  NonNullable<
    NonNullable<ZemanticAiBlock['options']>['responseMapping']
  >[number]
>

export const SearchResponseItem = ({ item, onItemChange }: Props) => {
  const changeValueToExtract = (
    valueToExtract: (typeof searchResponseValues)[number]
  ) => {
    onItemChange({ ...item, valueToExtract })
  }

  const changeVariableId = (variable: Pick<Variable, 'id'> | undefined) => {
    onItemChange({ ...item, variableId: variable ? variable.id : undefined })
  }

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <DropdownList
        currentItem={
          item.valueToExtract ??
          defaultZemanticAiResponseMappingItem.valueToExtract
        }
        items={searchResponseValues}
        onItemSelect={changeValueToExtract}
      />
      <VariableSearchInput
        onSelectVariable={changeVariableId}
        initialVariableId={item.variableId}
      />
    </Stack>
  )
}
