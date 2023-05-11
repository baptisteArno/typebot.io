import { Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { SetVariableBlock, Variable } from '@typebot.io/schemas'
import { byId, isEmpty } from '@typebot.io/lib'

export const SetVariableContent = ({ block }: { block: SetVariableBlock }) => {
  const { typebot } = useTypebot()
  const variableName =
    typebot?.variables.find(byId(block.options.variableId))?.name ?? ''
  return (
    <Text color={'gray.500'} noOfLines={4}>
      {variableName === '' && isEmpty(block.options.expressionToEvaluate)
        ? 'Click to edit...'
        : getExpression(typebot?.variables ?? [])(block.options)}
    </Text>
  )
}

const getExpression =
  (variables: Variable[]) =>
  (options: SetVariableBlock['options']): string | null => {
    const variableName = variables.find(byId(options.variableId))?.name ?? ''
    switch (options.type) {
      case 'Custom':
      case undefined:
        return `${variableName} = ${options.expressionToEvaluate}`
      case 'Map item with same index': {
        const baseItemVariable = variables.find(
          byId(options.mapListItemParams?.baseItemVariableId)
        )
        const baseListVariable = variables.find(
          byId(options.mapListItemParams?.baseListVariableId)
        )
        const targetListVariable = variables.find(
          byId(options.mapListItemParams?.targetListVariableId)
        )
        return `${variableName} = item in ${targetListVariable?.name} with same index as ${baseItemVariable?.name} in ${baseListVariable?.name}`
      }
      case 'Empty':
        return `Reset ${variableName}`
      case 'Random ID':
      case 'Today':
      case 'Tomorrow':
      case 'User ID':
      case 'Yesterday': {
        return `${variableName} = ${options.type}`
      }
    }
  }
