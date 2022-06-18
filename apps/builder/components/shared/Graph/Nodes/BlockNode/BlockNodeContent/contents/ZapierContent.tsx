import { Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import {
  defaultWebhookAttributes,
  MakeComBlock,
  PabblyConnectBlock,
  Webhook,
  ZapierBlock,
} from 'models'
import { useEffect } from 'react'
import { byId, isNotDefined } from 'utils'

type Props = {
  block: ZapierBlock | MakeComBlock | PabblyConnectBlock
  configuredLabel: string
}

export const ProviderWebhookContent = ({ block, configuredLabel }: Props) => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isNotDefined(webhook?.body))
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text noOfLines={1} pr="6">
      {webhook?.url ? configuredLabel : 'Disabled'}
    </Text>
  )
}
