import { Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { PabblyConnectBlock } from 'models'
import { byId, isNotDefined } from 'utils'

type Props = {
  block: PabblyConnectBlock
}

export const PabblyConnectContent = ({ block }: Props) => {
  const { webhooks } = useTypebot()
  const webhook = webhooks.find(byId(block.webhookId))

  if (isNotDefined(webhook?.body))
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={1} pr="6">
      {webhook?.url ? 'Trigger scenario' : 'Disabled'}
    </Text>
  )
}
