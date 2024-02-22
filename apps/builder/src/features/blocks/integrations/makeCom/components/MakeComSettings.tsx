import { Alert, AlertIcon, Button, Link, Stack, Text } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@/components/icons'
import { MakeComBlock, HttpRequest } from '@typebot.io/schemas'
import React from 'react'
import { HttpRequestAdvancedConfigForm } from '../../webhook/components/HttpRequestAdvancedConfigForm'

type Props = {
  block: MakeComBlock
  onOptionsChange: (options: MakeComBlock['options']) => void
}

export const MakeComSettings = ({
  block: { id: blockId, options },
  onOptionsChange,
}: Props) => {
  const setLocalWebhook = async (newLocalWebhook: HttpRequest) => {
    onOptionsChange({
      ...options,
      webhook: newLocalWebhook,
    })
  }

  const url = options?.webhook?.url

  return (
    <Stack spacing={4}>
      <Alert status={url ? 'success' : 'info'} rounded="md">
        <AlertIcon />
        {url ? (
          <>Your scenario is correctly configured 🚀</>
        ) : (
          <Stack>
            <Text>Head up to Make.com to configure this block:</Text>
            <Button
              as={Link}
              href="https://www.make.com/en/integrations/typebot"
              isExternal
              colorScheme="blue"
            >
              <Text mr="2">Make.com</Text> <ExternalLinkIcon />
            </Button>
          </Stack>
        )}
      </Alert>
      <HttpRequestAdvancedConfigForm
        blockId={blockId}
        webhook={options?.webhook}
        options={options}
        onWebhookChange={setLocalWebhook}
        onOptionsChange={onOptionsChange}
      />
    </Stack>
  )
}
