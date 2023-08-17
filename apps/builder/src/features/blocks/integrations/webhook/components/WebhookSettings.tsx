import React from 'react'
import { Spinner, Stack } from '@chakra-ui/react'
import { WebhookOptions, Webhook, WebhookBlock } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'
import { WebhookAdvancedConfigForm } from './WebhookAdvancedConfigForm'

type Props = {
  block: WebhookBlock
  onOptionsChange: (options: WebhookOptions) => void
}

export const WebhookSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const setLocalWebhook = async (newLocalWebhook: Webhook) => {
    if (!options.webhook) return
    onOptionsChange({ ...options, webhook: newLocalWebhook })
    return
  }

  const updateUrl = (url: string) => {
    if (!options.webhook) return
    onOptionsChange({ ...options, webhook: { ...options.webhook, url } })
  }

  if (!options.webhook) return <Spinner />

  return (
    <Stack spacing={4}>
      <TextInput
        placeholder="Paste webhook URL..."
        defaultValue={options.webhook?.url ?? ''}
        onChange={updateUrl}
      />
      <WebhookAdvancedConfigForm
        blockId={blockId}
        webhook={options.webhook as Webhook}
        options={options}
        onWebhookChange={setLocalWebhook}
        onOptionsChange={onOptionsChange}
      />
    </Stack>
  )
}
