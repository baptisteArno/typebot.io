import { Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { SetVariableBlock } from 'models'
import { byId } from 'utils'

export const SetVariableContent = ({ block }: { block: SetVariableBlock }) => {
  const { typebot } = useTypebot()
  const variableName =
    typebot?.variables.find(byId(block.options.variableId))?.name ?? ''
  const expression = block.options.expressionToEvaluate ?? ''
  return (
    <Text color={'gray.500'} noOfLines={2}>
      {variableName === '' && expression === ''
        ? 'Click to edit...'
        : `${variableName} ${expression ? `= ${expression}` : ``}`}
    </Text>
  )
}
