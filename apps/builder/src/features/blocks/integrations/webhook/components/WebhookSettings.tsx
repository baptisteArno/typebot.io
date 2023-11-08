import React from 'react'
import { Stack } from '@chakra-ui/react'
import { Webhook, WebhookBlock } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'
import { WebhookAdvancedConfigForm } from './WebhookAdvancedConfigForm'

type Props = {
  block: WebhookBlock
  onOptionsChange: (options: WebhookBlock['options']) => void
}

export const WebhookSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const setLocalWebhook = async (newLocalWebhook: Webhook) => {
    onOptionsChange({ ...options, webhook: newLocalWebhook })
  }

  const updateUrl = (url: string) => {
    onOptionsChange({ ...options, webhook: { ...options?.webhook, url } })
  }

  return (
    <Stack spacing={4}>
      <TextInput
        placeholder="Paste webhook URL..."
        defaultValue={options?.webhook?.url}
        onChange={updateUrl}
      />
      <WebhookAdvancedConfigForm
        blockId={blockId}
        webhook={options?.webhook}
        options={options}
        onWebhookChange={setLocalWebhook}
        onOptionsChange={onOptionsChange}
      />
    </Stack>
  )
}
