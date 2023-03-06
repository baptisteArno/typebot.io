import React, { useEffect, useState } from 'react'
import { Spinner, Stack } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { WebhookOptions, Webhook, WebhookBlock } from 'models'
import { byId, env } from 'utils'
import { TextInput } from '@/components/inputs'
import { useDebouncedCallback } from 'use-debounce'
import { WebhookAdvancedConfigForm } from '../WebhookAdvancedConfigForm'

const debounceWebhookTimeout = 2000

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
  const updateWebhookDebounced = useDebouncedCallback(
    async (newLocalWebhook) => {
      await updateWebhook(newLocalWebhook.id, newLocalWebhook)
    },
    env('E2E_TEST') === 'true' ? 0 : debounceWebhookTimeout
  )

  const setLocalWebhook = (newLocalWebhook: Webhook) => {
    _setLocalWebhook(newLocalWebhook)
    updateWebhookDebounced(newLocalWebhook)
  }

  useEffect(
    () => () => {
      updateWebhookDebounced.flush()
    },
    [updateWebhookDebounced]
  )

  const handleUrlChange = (url?: string) =>
    localWebhook && setLocalWebhook({ ...localWebhook, url: url ?? null })

  if (!localWebhook) return <Spinner />

  return (
    <Stack spacing={4}>
      <TextInput
        placeholder="Paste webhook URL..."
        defaultValue={localWebhook.url ?? ''}
        onChange={handleUrlChange}
        debounceTimeout={0}
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
