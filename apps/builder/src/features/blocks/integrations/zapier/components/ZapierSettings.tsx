import { Alert, AlertIcon, Button, Link, Stack, Text } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Webhook, WebhookOptions, ZapierBlock } from '@typebot.io/schemas'
import React, { useCallback, useEffect, useState } from 'react'
import { byId } from '@typebot.io/lib'
import { WebhookAdvancedConfigForm } from '../../webhook/components/WebhookAdvancedConfigForm'

type Props = {
  block: ZapierBlock
  onOptionsChange: (options: WebhookOptions) => void
}

export const ZapierSettings = ({
  block: { webhookId, id: blockId, options },
  onOptionsChange,
}: Props) => {
  const { webhooks, updateWebhook } = useTypebot()
  const webhook = webhooks.find(byId(webhookId))

  const [localWebhook, _setLocalWebhook] = useState(webhook)

  const setLocalWebhook = useCallback(
    async (newLocalWebhook: Webhook) => {
      _setLocalWebhook(newLocalWebhook)
      await updateWebhook(newLocalWebhook.id, newLocalWebhook)
    },
    [updateWebhook]
  )

  useEffect(() => {
    if (
      !localWebhook ||
      localWebhook.url ||
      !webhook?.url ||
      webhook.url === localWebhook.url
    )
      return
    setLocalWebhook({
      ...localWebhook,
      url: webhook?.url,
    })
  }, [webhook, localWebhook, setLocalWebhook])

  return (
    <Stack spacing={4}>
      <Alert status={localWebhook?.url ? 'success' : 'info'} rounded="md">
        <AlertIcon />
        {localWebhook?.url ? (
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
