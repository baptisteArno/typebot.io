import { Stack, Box, Flex, Text } from '@chakra-ui/react'
import { DropdownList } from 'components/shared/DropdownList'
import { Input } from 'components/shared/Textbox/Input'
import { TableListItemProps } from 'components/shared/TableList'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { SourceEndpoint } from '../../../../../Endpoints'
import { Comparison, Variable, ComparisonOperators } from 'models'

export const AssignToTeamContentItems = ({
  item,
  onItemChange,
}: TableListItemProps<Comparison>) => {

  return (
    <Stack>
      <Text color={'gray.500'} h={'auto'} ml={'8px'}>
        Direcione à um atendente
      </Text>
    </Stack>
  )
}
