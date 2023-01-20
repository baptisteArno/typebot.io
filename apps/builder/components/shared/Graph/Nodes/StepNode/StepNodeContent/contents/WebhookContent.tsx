import { Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { StepIndices, WebhookStep } from 'models'
import { byId } from 'utils'

type Props = {
  step: WebhookStep,
  indices: StepIndices,
}

export const WebhookContent = (
  {
    step,
    indices: { blockIndex, stepIndex }
  }: Props) => {

  // {typebot?.blocks[blockIndex].steps[stepIndex].options['name']} //bloco no typebot

  // const { webhooks } = useTypebot()
  // const webhook = webhooks.find(byId(webhookId))

  return (
    <Text color="gray.500">Configuração...</Text>
  )
}
