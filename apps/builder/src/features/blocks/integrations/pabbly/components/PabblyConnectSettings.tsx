import { Alert, AlertIcon, Button, Link, Stack, Text } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@/components/icons'
import {
  PabblyConnectBlock,
  Webhook,
  WebhookOptions,
} from '@typebot.io/schemas'
import React from 'react'
import { WebhookAdvancedConfigForm } from '../../webhook/components/WebhookAdvancedConfigForm'
import { TextInput } from '@/components/inputs'

type Props = {
  block: PabblyConnectBlock
  onOptionsChange: (options: WebhookOptions) => void
}

export const PabblyConnectSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const setLocalWebhook = async (newLocalWebhook: Webhook) => {
    if (!options.webhook) return
    onOptionsChange({
      ...options,
      webhook: newLocalWebhook,
    })
  }

  const updateUrl = (url: string) => {
    if (!options.webhook) return
    onOptionsChange({ ...options, webhook: { ...options.webhook, url } })
  }

  const url = options.webhook?.url

  return (
    <Stack spacing={4}>
      <Alert status={url ? 'success' : 'info'} rounded="md">
        <AlertIcon />
        {url ? (
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
        defaultValue={url ?? ''}
        onChange={updateUrl}
        withVariableButton={false}
        debounceTimeout={0}
      />
      {options.webhook && (
        <WebhookAdvancedConfigForm
          blockId={blockId}
          webhook={options.webhook as Webhook}
          options={options}
          onWebhookChange={setLocalWebhook}
          onOptionsChange={onOptionsChange}
        />
      )}
    </Stack>
  )
}
