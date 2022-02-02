import { Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { WebhookStep } from 'models'
import { useMemo } from 'react'

type Props = {
  step: WebhookStep
}

export const WebhookContent = ({ step }: Props) => {
  const { typebot } = useTypebot()
  const webhook = useMemo(
    () => typebot?.webhooks.byId[step.options?.webhookId ?? ''],
    [step.options?.webhookId, typebot?.webhooks.byId]
  )
  if (!webhook?.url) return <Text color="gray.500">Configure...</Text>
  return (
    <Text isTruncated pr="6">
      {webhook.method} {webhook.url}
    </Text>
  )
}
