import { Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { WebhookStep } from 'models'
import { byId } from 'utils'

type Props = {
  step: WebhookStep
}

export const WebhookContent = ({ step: { webhookId } }: Props) => {
  const { webhooks } = useTypebot()
  const webhook = webhooks.find(byId(webhookId))

  if (!webhook?.url) return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={2} pr="6">
      {webhook.method} {webhook.url}
    </Text>
  )
}
