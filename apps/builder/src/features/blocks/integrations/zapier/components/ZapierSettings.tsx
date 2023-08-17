import { Alert, AlertIcon, Button, Link, Stack, Text } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@/components/icons'
import { Webhook, WebhookOptions, ZapierBlock } from '@typebot.io/schemas'
import React from 'react'
import { WebhookAdvancedConfigForm } from '../../webhook/components/WebhookAdvancedConfigForm'

type Props = {
  block: ZapierBlock
  onOptionsChange: (options: WebhookOptions) => void
}

export const ZapierSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const setLocalWebhook = async (newLocalWebhook: Webhook) => {
    if (!options.webhook) return
    onOptionsChange({
      ...options,
      webhook: newLocalWebhook,
    })
    return
  }

  const url = options.webhook?.url

  return (
    <Stack spacing={4}>
      <Alert status={url ? 'success' : 'info'} rounded="md">
        <AlertIcon />
        {url ? (
          <>Your zap is correctly configured 🚀</>
        ) : (
          <Stack>
            <Text>Head up to Zapier to configure this block:</Text>
            <Button
              as={Link}
              href="https://zapier.com/apps/typebot/integrations"
              isExternal
              colorScheme="blue"
            >
              <Text mr="2">Zapier</Text> <ExternalLinkIcon />
            </Button>
          </Stack>
        )}
      </Alert>
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
