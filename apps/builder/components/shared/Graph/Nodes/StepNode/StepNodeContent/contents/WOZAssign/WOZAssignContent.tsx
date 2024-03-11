import { StepIndices, WOZAssignStep } from 'models'
import React from 'react'
import { Stack, Text, Tooltip } from '@chakra-ui/react'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import OctaTooltip from 'components/octaComponents/OctaTooltip/OctaTooltip'

type Props = {
  step: WOZAssignStep
  indices: StepIndices
}

const WOZAssignContent = ({ step, indices }: Props) => {
  return (
    <Stack>
      <Text noOfLines={0}>
        Agente: {!step?.options?.virtualAgentId ? 'Woz' : `${step?.options?.virtualAgentId}`}
      </Text>
      <OctaDivider />
      <Text noOfLines={0}>
        Apresenta-se como IA? {step?.options?.introduceAsIA ? 'Sim' : 'Não'}
      </Text>
      <OctaDivider />
      <Text noOfLines={0}>
        Confirma ida para próxima ação? {step?.options?.confirmContext ? 'Sim' : 'Não'}
      </Text>
      <OctaDivider />
      <Text noOfLines={0}>
        Redirecionamento baseado no assunto da conversa:
      </Text>
      <ItemNodesList step={step} indices={indices} />
      <OctaDivider />
      <Text fontSize={"13px"} align={"center"} color={"blue"}>
        <span>Saiba mais...</span>
      </Text>
    </Stack>
  )
}

export default WOZAssignContent