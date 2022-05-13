import { Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import { SetVariableStep } from 'models'
import { byId } from 'utils'

export const SetVariableContent = ({ step }: { step: SetVariableStep }) => {
  const { typebot } = useTypebot()
  const variableName =
    typebot?.variables.find(byId(step.options.variableId))?.name ?? ''
  const expression = step.options.expressionToEvaluate ?? ''
  return (
    <Text color={'gray.500'} noOfLines={2}>
      {variableName === '' && expression === ''
        ? 'Click to edit...'
        : `${variableName} ${expression ? `= ${expression}` : ``}`}
    </Text>
  )
}
