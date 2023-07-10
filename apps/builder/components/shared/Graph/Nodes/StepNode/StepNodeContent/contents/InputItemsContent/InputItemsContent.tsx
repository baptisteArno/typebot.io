import { InputOptions, StepIndices, StepWithItems } from 'models'
import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { Container, Space } from './InputItemsContent.style'
import { WithVariableContent } from '../WithVariableContent'
import { ItemNodesList } from 'components/shared/Graph/Nodes/ItemNode'

type Props = {
  step: StepWithItems & {
    type: string
    options: InputOptions
  },
  indices: StepIndices
}

const InputItemsContent = ({ step, indices }: Props) => {
  return (
    <Container>
      {
        <Stack>
          <Text color={'gray.500'} noOfLines={0}>
            <strong>Texto da pergunta:</strong>
          </Text>
          <Text color={'gray.500'} noOfLines={0}>
            {step.options.message?.plainText && <label>{step.options.message?.plainText}</label>}
            {!step.options.message?.plainText && <i>Não informado.</i>}
          </Text>
        </Stack>
      }
      <ItemNodesList step={step} indices={indices} />
      <Space>
        <WithVariableContent variableId={step.options?.variableId} />
      </Space>

    </Container>
  )
}

export default InputItemsContent