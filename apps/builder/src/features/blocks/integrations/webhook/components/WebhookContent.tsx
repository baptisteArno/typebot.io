import { Stack, Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { WebhookBlock } from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'
import { SetVariableLabel } from '@/components/SetVariableLabel'

type Props = {
  block: WebhookBlock
}

export const WebhookContent = ({ block: { webhookId, options } }: Props) => {
  const { typebot } = useTypebot()
  const { webhooks } = useTypebot()
  const webhook = webhooks.find(byId(webhookId))

  if (!webhook?.url) return <Text color="gray.500">Configure...</Text>
  return (
    <Stack w="full">
      <Text noOfLines={2} pr="6">
        {webhook.method} {webhook.url}
      </Text>
      {options.responseVariableMapping
        .filter((mapping) => mapping.variableId)
        .map((mapping) => (
          <SetVariableLabel
            key={mapping.variableId}
            variableId={mapping.variableId as string}
            variables={typebot?.variables}
          />
        ))}
    </Stack>
  )
}
