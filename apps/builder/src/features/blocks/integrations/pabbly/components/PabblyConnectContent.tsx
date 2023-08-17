import { Text } from '@chakra-ui/react'
import { PabblyConnectBlock } from '@typebot.io/schemas'
import { isNotDefined } from '@typebot.io/lib'

type Props = {
  block: PabblyConnectBlock
}

export const PabblyConnectContent = ({ block }: Props) => {
  const webhook = block.options.webhook

  if (isNotDefined(webhook?.body))
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={1} pr="6">
      {webhook?.url ? 'Trigger scenario' : 'Disabled'}
    </Text>
  )
}
