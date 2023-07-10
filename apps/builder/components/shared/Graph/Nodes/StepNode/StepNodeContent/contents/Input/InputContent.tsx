import { InputOptions, Variable } from 'models'
import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { Container, Space } from './InputContent.style'
import { WithVariableContent } from '../WithVariableContent'
import { useTypebot } from 'contexts/TypebotContext'

type Props = {
  step: {
    type: string
    options: InputOptions
  },
  onUpdateStep: (options: InputOptions) => void
}

const InputContent = ({ step, onUpdateStep }: Props) => {
  const { typebot } = useTypebot()

  const handleVariableChange = (variable: Variable) => {
    if (variable) {
      onUpdateStep({
        ...step.options, variableId: variable?.id, property: {
          domain: "CHAT",
          name: variable.name,
          type: variable.type ? variable.type : "string",
          token: variable.token
        }
      })
    }
  }

  if (!step.options.variableId && step.options.initialVariableToken) {
    let myVariable = typebot?.variables?.find(v => v.token === step.options.initialVariableToken)
    if (myVariable) {
      step.options.variableId = myVariable.id
      handleVariableChange(myVariable)
    }
  }

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
      <Space>
        <WithVariableContent variableId={step.options?.variableId} />
      </Space>

    </Container>
  )
}

export default InputContent