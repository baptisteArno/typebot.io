import { Text } from '@chakra-ui/react'
import { WebhookStep } from 'models'

type Props = {
  step: WebhookStep
}

export const WebhookContent = ({ step: { webhook } }: Props) => {
  if (!webhook?.url) return <Text color="gray.500">Configure...</Text>
  return (
    <Text isTruncated pr="6">
      {webhook.method} {webhook.url}
    </Text>
  )
}
