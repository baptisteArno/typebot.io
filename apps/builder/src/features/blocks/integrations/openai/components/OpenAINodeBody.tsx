import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Stack, Text } from '@chakra-ui/react'
import { OpenAIBlock } from '@typebot.io/schemas/features/blocks/integrations/openai'

type Props = {
  options: OpenAIBlock['options']
}

export const OpenAINodeBody = ({ options }: Props) => {
  const { typebot } = useTypebot()

  return (
    <Stack>
      <Text color={options?.task ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {options?.task ?? 'Configure...'}
      </Text>
      {typebot &&
        options &&
        'responseMapping' in options &&
        options.responseMapping
          ?.map((mapping) => mapping.variableId)
          .map((variableId, idx) =>
            variableId ? (
              <SetVariableLabel
                key={variableId + idx}
                variables={typebot.variables}
                variableId={variableId}
              />
            ) : null
          )}
      {typebot &&
        options &&
        'saveUrlInVariableId' in options &&
        options.saveUrlInVariableId && (
          <SetVariableLabel
            variables={typebot.variables}
            variableId={options.saveUrlInVariableId}
          />
        )}
    </Stack>
  )
}
