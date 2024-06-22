import { Text } from '@chakra-ui/react'
import { PabblyConnectBlock } from '@sniper.io/schemas'

type Props = {
  block: PabblyConnectBlock
}

export const PabblyConnectContent = ({ block }: Props) => {
  if (!block.options?.webhook?.url)
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={1} pr="6">
      Trigger scenario
    </Text>
  )
}
