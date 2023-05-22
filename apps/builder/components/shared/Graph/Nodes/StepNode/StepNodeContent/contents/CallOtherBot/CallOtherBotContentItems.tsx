import { Stack, Text } from '@chakra-ui/react'
import { TableListItemProps } from 'components/shared/TableList'
import { Comparison } from 'models'

export const CallOtherBotContentItems = ({
  item,
  onItemChange,
}: TableListItemProps<Comparison>) => {

  return (
    <Stack>
      <Text color={'gray.500'} h={'auto'}>
        Chamar outro bot
      </Text>
    </Stack>
  )
}
