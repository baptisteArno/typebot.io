import { Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { WebhookBlock } from 'models'
import { byId } from 'utils'

type Props = {
  block: WebhookBlock
}

export const WebhookContent = ({ block: { webhookId } }: Props) => {
  const { webhooks } = useTypebot()
  const webhook = webhooks.find(byId(webhookId))

  if (!webhook?.url) return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={2} pr="6">
      {webhook.method} {webhook.url}
    </Text>
  )
}
