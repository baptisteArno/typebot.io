import { Text, VStack, Tag } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { DeclareVariablesBlock } from '@typebot.io/schemas'
import { byId } from '@typebot.io/lib'

export const DeclareVariablesContent = ({
  block,
}: {
  block: DeclareVariablesBlock
}) => {
  const { typebot } = useTypebot()
  const variables = block.options?.variables ?? []

  if (variables.length === 0) {
    return <Text color="gray.500">Click to add input variables...</Text>
  }

  return (
    <VStack align="start" spacing={1}>
      {variables.map((v) => {
        const variable = typebot?.variables.find(byId(v.variableId))
        const isOptional = v.required === false
        return (
          <Tag
            key={v.variableId}
            size="sm"
            colorScheme={isOptional ? 'gray' : 'blue'}
          >
            {variable?.name ?? 'Unknown'}
            {isOptional ? ' (optional)' : ''}
          </Tag>
        )
      })}
    </VStack>
  )
}
