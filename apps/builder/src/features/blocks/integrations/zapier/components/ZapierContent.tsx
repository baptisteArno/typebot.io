import { Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { defaultWebhookAttributes, Webhook, ZapierBlock } from 'models'
import { useEffect } from 'react'
import { byId, isNotDefined } from 'utils'

type Props = {
  block: ZapierBlock
}

export const ZapierContent = ({ block }: Props) => {
  const { webhooks, typebot, updateWebhook } = useTypebot()
  const webhook = webhooks.find(byId(block.webhookId))

  useEffect(() => {
    if (!typebot) return
    if (!webhook) {
      const { webhookId } = block
      const newWebhook = {
        id: webhookId,
        ...defaultWebhookAttributes,
        typebotId: typebot.id,
      } as Webhook
      updateWebhook(webhookId, newWebhook)
    }
  }, [block, typebot, updateWebhook, webhook])

  if (isNotDefined(webhook?.body))
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={1} pr="6">
      {webhook?.url ? 'Trigger zap' : 'Disabled'}
    </Text>
  )
}
