import { InputOptions, StepIndices, StepWithItems } from 'models'
import React from 'react'
import { Stack } from '@chakra-ui/react'
import { WithVariableContent } from '../WithVariableContent'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { useTypebot } from 'contexts/TypebotContext'
import { TextHtmlContent } from '../TextHtmlContent'

type Props = {
  step: StepWithItems & {
    type: string
    options: InputOptions
  },
  indices: StepIndices
}

const InputItemsContent = ({ step, indices }: Props) => {
  const { typebot } = useTypebot()
  return (

    <Stack>
      <TextHtmlContent html={step.options.message?.html} />

      <OctaDivider />
      <ItemNodesList step={step} indices={indices} />
      <WithVariableContent variableId={step.options?.variableId} property={step.options?.property} />
    </Stack>
  )
}

export default InputItemsContent