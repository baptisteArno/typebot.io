import { InputOptions, Variable } from 'models'
import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { WithVariableContent } from '../WithVariableContent'
import { useTypebot } from 'contexts/TypebotContext'
import { OctaDivider } from 'assets/OctaDivider'

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
    <Stack>
      <Text noOfLines={0}>
        {step.options.message?.plainText && step.options.message?.plainText}
        {!step.options.message?.plainText && <span>Clique para editar...</span>}
      </Text>

      <OctaDivider />
      <WithVariableContent variableId={step.options?.variableId} />
    </Stack>
  )
}

export default InputContent