import { Tag, Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { SetVariableBlock, Variable } from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'

export const SetVariableContent = ({ block }: { block: SetVariableBlock }) => {
  const { typebot } = useTypebot()
  const variableName =
    typebot?.variables.find(byId(block.options?.variableId))?.name ?? ''
  return (
    <Text color={'gray.500'} noOfLines={4}>
      {variableName === '' ? (
        'Click to edit...'
      ) : (
        <Expression
          options={block.options}
          variables={typebot?.variables ?? []}
        />
      )}
    </Text>
  )
}

const Expression = ({
  options,
  variables,
}: {
  options: SetVariableBlock['options']
  variables: Variable[]
}): JSX.Element | null => {
  const variableName = variables.find(byId(options?.variableId))?.name ?? ''
  switch (options?.type) {
    case 'Custom':
    case undefined:
      return (
        <Text as="span">
          {variableName} = {options?.expressionToEvaluate}
        </Text>
      )
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
      return (
        <Text as="span">
          {variableName} = item in ${targetListVariable?.name} with same index
          as ${baseItemVariable?.name} in ${baseListVariable?.name}
        </Text>
      )
    }
    case 'Append value(s)': {
      return (
        <Text as="span">
          Append {options.item} in {variableName}
        </Text>
      )
    }
    case 'Empty':
      return <Text as="span">Reset {variableName} </Text>
    case 'Shift':
    case 'Pop': {
      const itemVariableName = variables.find(
        byId(options.saveItemInVariableId)
      )?.name
      return (
        <Text as="span">
          {options.type} {variableName}
          {itemVariableName ? ` into ${itemVariableName}` : ''}
        </Text>
      )
    }
    case 'Random ID':
    case 'Today':
    case 'Now':
    case 'Tomorrow':
    case 'User ID':
    case 'Result ID':
    case 'Moment of the day':
    case 'Environment name':
    case 'Transcript':
    case 'Yesterday': {
      return (
        <Text as="span">
          {variableName} = <Tag colorScheme="purple">System.{options.type}</Tag>
        </Text>
      )
    }
    case 'Contact name':
    case 'Phone number':
      return (
        <Text as="span">
          {variableName} ={' '}
          <Tag colorScheme="purple">WhatsApp.{options.type}</Tag>
        </Text>
      )
  }
}
