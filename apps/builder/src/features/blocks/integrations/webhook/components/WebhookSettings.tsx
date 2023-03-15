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
    _setLocalWebhook(newLocalWebhook)
    await updateWebhook(newLocalWebhook.id, newLocalWebhook)
  }

  const updateUrl = (url?: string) =>
    localWebhook && setLocalWebhook({ ...localWebhook, url: url ?? null })

  if (!localWebhook) return <Spinner />

  return (
    <Stack spacing={4}>
      <TextInput
        placeholder="Paste webhook URL..."
        defaultValue={localWebhook.url ?? ''}
        onChange={updateUrl}
      />
      <WebhookAdvancedConfigForm
        blockId={blockId}
        webhook={localWebhook}
        options={options}
        onWebhookChange={setLocalWebhook}
        onOptionsChange={onOptionsChange}
      />
    </Stack>
  )
}
