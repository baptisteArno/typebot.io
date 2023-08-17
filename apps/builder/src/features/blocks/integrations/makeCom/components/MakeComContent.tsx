import { Text } from '@chakra-ui/react'
import { MakeComBlock } from '@typebot.io/schemas'
import { isNotDefined } from '@typebot.io/lib'

type Props = {
  block: MakeComBlock
}

export const MakeComContent = ({ block }: Props) => {
  const webhook = block.options.webhook

  if (isNotDefined(webhook?.body))
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={1} pr="6">
      {webhook?.url ? 'Trigger scenario' : 'Disabled'}
    </Text>
  )
}
