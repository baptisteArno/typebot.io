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
import { ZapierStep } from 'models'
import React from 'react'

type Props = {
  step: ZapierStep
}

export const ZapierSettings = ({ step }: Props) => {
  return (
    <Stack spacing={4}>
      <Alert
        status={step.webhook.url ? 'success' : 'info'}
        bgColor={step.webhook.url ? undefined : 'blue.50'}
        rounded="md"
      >
        <AlertIcon />
        {step.webhook.url ? (
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
      {step.webhook.url && <Input value={step.webhook.url} isDisabled />}
    </Stack>
  )
}
