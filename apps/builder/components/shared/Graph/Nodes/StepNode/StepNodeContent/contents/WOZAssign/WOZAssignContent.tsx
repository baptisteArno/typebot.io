import { StepIndices, WOZAssignStep } from 'models'
import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { useTypebot } from 'contexts/TypebotContext'

type Props = {
  step: WOZAssignStep
  indices: StepIndices
}

const WOZAssignContent = ({ step, indices }: Props) => {
  const { wozProfiles } = useTypebot()

  const agent = wozProfiles.find((d) => d.id === step?.options?.virtualAgentId)

  const agentName = () => {
    if (!agent?.name) return 'Woz'

    if (!agent.active) {
      return `${agent.name} (inativo)`
    }

    return agent.name
  }

  return (
    <Stack>
      <Text noOfLines={0}>Agente: {agentName()}</Text>

      <OctaDivider />

      <Text noOfLines={0}>
        Apresenta-se como IA? {step?.options?.introduceAsIA ? 'Sim' : 'Não'}
      </Text>

      <OctaDivider />

      <Text noOfLines={0}>
        Confirma ida para próxima ação?{' '}
        {step?.options?.confirmContext ? 'Sim' : 'Não'}
      </Text>

      <OctaDivider />

      <Text noOfLines={0}>
        Redirecionamento baseado no assunto da conversa:
      </Text>

      <ItemNodesList step={step} indices={indices} />

      <OctaDivider />
      <Text fontSize={'13px'} align={'center'} color={'blue'}>
        <span>Saiba mais...</span>
      </Text>
    </Stack>
  )
}

export default WOZAssignContent
