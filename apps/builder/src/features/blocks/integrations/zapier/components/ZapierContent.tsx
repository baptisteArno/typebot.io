import { Text } from '@chakra-ui/react'
import { ZapierBlock } from '@typebot.io/schemas'

type Props = {
  block: ZapierBlock
}

export const ZapierContent = ({ block }: Props) => {
  if (!block.options?.webhook?.url)
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={1} pr="6">
      Trigger zap
    </Text>
  )
}
