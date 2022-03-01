import { Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { ZapierStep } from 'models'
import { byId, isNotDefined } from 'utils'

type Props = {
  step: ZapierStep
}

export const ZapierContent = ({ step: { webhookId } }: Props) => {
  const { webhooks } = useTypebot()
  const webhook = webhooks.find(byId(webhookId))

  if (isNotDefined(webhook?.body))
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text isTruncated pr="6">
      {webhook?.url ? 'Enabled' : 'Disabled'}
    </Text>
  )
}
