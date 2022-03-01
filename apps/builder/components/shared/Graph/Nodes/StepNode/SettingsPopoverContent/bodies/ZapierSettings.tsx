import {
  Alert,
  AlertIcon,
  Button,
  Input,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext'
import { ZapierStep } from 'models'
import React from 'react'
import { byId } from 'utils'

type Props = {
  step: ZapierStep
}

export const ZapierSettings = ({ step }: Props) => {
  const { webhooks } = useTypebot()
  const webhook = webhooks.find(byId(step.webhookId))

  return (
    <Stack spacing={4}>
      <Alert
        status={webhook?.url ? 'success' : 'info'}
        bgColor={webhook?.url ? undefined : 'blue.50'}
        rounded="md"
      >
        <AlertIcon />
        {webhook?.url ? (
          <>Your zap is correctly configured 🚀</>
        ) : (
          <Stack>
            <Text>Head up to Zapier to configure this step:</Text>
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
      {webhook?.url && <Input value={webhook?.url} isDisabled />}
    </Stack>
  )
}
