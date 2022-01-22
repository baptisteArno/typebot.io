import { Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { SetVariableStep } from 'models'

export const SetVariableNodeContent = ({ step }: { step: SetVariableStep }) => {
  const { typebot } = useTypebot()
  const variableName =
    typebot?.variables.byId[step.options?.variableId ?? '']?.name ?? ''
  const expression = step.options?.expressionToEvaluate ?? ''
  return (
    <Text color={'gray.500'}>
      {variableName === '' && expression === ''
        ? 'Click to edit...'
        : `${variableName} = ${expression}`}
    </Text>
  )
}
