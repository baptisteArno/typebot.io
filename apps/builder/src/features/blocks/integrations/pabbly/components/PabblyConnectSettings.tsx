import { Alert, AlertIcon, Button, Link, Stack, Text } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor'
import { PabblyConnectBlock, Webhook, WebhookOptions } from 'models'
import React, { useEffect, useState } from 'react'
import { byId, env } from 'utils'
import { WebhookAdvancedConfigForm } from '../../webhook/components/WebhookAdvancedConfigForm'
import { useDebouncedCallback } from 'use-debounce'
import { TextInput } from '@/components/inputs'

const debounceWebhookTimeout = 2000

type Props = {
  block: PabblyConnectBlock
  onOptionsChange: (options: WebhookOptions) => void
}

export const PabblyConnectSettings = ({
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

  const handleUrlChange = (url: string) =>
    localWebhook &&
    setLocalWebhook({
      ...localWebhook,
      url,
    })

  return (
    <Stack spacing={4}>
      <Alert status={localWebhook?.url ? 'success' : 'info'} rounded="md">
        <AlertIcon />
        {localWebhook?.url ? (
          <>Your scenario is correctly configured 🚀</>
        ) : (
          <Stack>
            <Text>Head up to Pabbly Connect to get the webhook URL:</Text>
            <Button
              as={Link}
              href="https://www.pabbly.com/connect/integrations/typebot/"
              isExternal
              colorScheme="blue"
            >
              <Text mr="2">Pabbly.com</Text> <ExternalLinkIcon />
            </Button>
          </Stack>
        )}
      </Alert>
      <TextInput
        placeholder="Paste webhook URL..."
        defaultValue={localWebhook?.url ?? ''}
        onChange={handleUrlChange}
        withVariableButton={false}
        debounceTimeout={0}
      />
      {localWebhook && (
        <WebhookAdvancedConfigForm
          blockId={blockId}
          webhook={localWebhook}
          options={options}
          onWebhookChange={setLocalWebhook}
          onOptionsChange={onOptionsChange}
        />
      )}
    </Stack>
  )
}
