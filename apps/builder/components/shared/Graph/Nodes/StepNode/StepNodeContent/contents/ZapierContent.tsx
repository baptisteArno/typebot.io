import { Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import {
  defaultWebhookAttributes,
  MakeComStep,
  PabblyConnectStep,
  Webhook,
  ZapierStep,
} from 'models'
import { useEffect } from 'react'
import { byId, isNotDefined } from 'utils'

type Props = {
  step: ZapierStep | MakeComStep | PabblyConnectStep
  configuredLabel: string
}

export const ProviderWebhookContent = ({ step, configuredLabel }: Props) => {
  const { webhooks, typebot, updateWebhook } = useTypebot()
  const webhook = webhooks.find(byId(step.webhookId))

  useEffect(() => {
    if (!typebot) return
    if (!webhook) {
      const { webhookId } = step
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
    return <Text color="gray.500">Configuração...</Text>
  return (
    <Text noOfLines={0} pr="6">
      {webhook?.url ? configuredLabel : 'Disabled'}
    </Text>
  )
}
