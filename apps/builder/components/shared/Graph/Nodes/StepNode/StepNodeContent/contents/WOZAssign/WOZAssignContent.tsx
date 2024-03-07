import { StepIndices, WOZAssignStep } from 'models'
import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'

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
        Caso a conversa se encaminhe para esses temas, siga o fluxo:
      </Text>
      <ItemNodesList step={step} indices={indices} />
    </Stack>
  )
}

export default WOZAssignContent