import { InputOptions, StepIndices, StepWithItems } from 'models'
import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { Container, Space } from './InputItemsContent.style'
import { WithVariableContent } from '../WithVariableContent'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { OctaDivider } from 'assets/OctaDivider'

type Props = {
  step: StepWithItems & {
    type: string
    options: InputOptions
  },
  indices: StepIndices
}

const InputItemsContent = ({ step, indices }: Props) => {
  return (

    <Stack>
      <Text noOfLines={0}>
        {step.options.message?.plainText && step.options.message?.plainText}
        {!step.options.message?.plainText && <label>Clique para editar...</label>}
      </Text>
      <OctaDivider />
      <ItemNodesList step={step} indices={indices} />
      <WithVariableContent variableId={step.options?.variableId} property={step.options?.property} />
    </Stack>
  )
}

export default InputItemsContent