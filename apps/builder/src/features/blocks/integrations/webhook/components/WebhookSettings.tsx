import React, { useState } from 'react'
import { Spinner, Stack } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { WebhookOptions, Webhook, WebhookBlock } from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'
import { TextInput } from '@/components/inputs'
import { WebhookAdvancedConfigForm } from './WebhookAdvancedConfigForm'

type Props = {
  block: WebhookBlock
  onOptionsChange: (options: WebhookOptions) => void
}

export const WebhookSettings = ({
  block: { webhookId, id: blockId, options },
  onOptionsChange,
}: Props) => {
  const { webhooks, updateWebhook } = useTypebot()
  const [localWebhook, _setLocalWebhook] = useState(
    webhooks.find(byId(webhookId))
  )

  const setLocalWebhook = async (newLocalWebhook: Webhook) => {
    if (options.webhook) {
      onOptionsChange({ ...options, webhook: newLocalWebhook })
      return
    }
    _setLocalWebhook(newLocalWebhook)
    await updateWebhook(newLocalWebhook.id, newLocalWebhook)
  }

  const updateUrl = (url: string) => {
    if (options.webhook)
      onOptionsChange({ ...options, webhook: { ...options.webhook, url } })
    else if (localWebhook)
      setLocalWebhook({ ...localWebhook, url: url ?? undefined })
  }

  if (!localWebhook && !options.webhook) return <Spinner />

  return (
    <Stack spacing={4}>
      <TextInput
        placeholder="Paste webhook URL..."
        defaultValue={options.webhook?.url ?? localWebhook?.url ?? ''}
        onChange={updateUrl}
      />
      <WebhookAdvancedConfigForm
        blockId={blockId}
        webhook={(options.webhook ?? localWebhook) as Webhook}
        options={options}
        onWebhookChange={setLocalWebhook}
        onOptionsChange={onOptionsChange}
      />
    </Stack>
  )
}
