import { SetVariableLabel } from '@/components/SetVariableLabel'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { Stack, Text } from '@chakra-ui/react'
import { OpenAIBlock } from '@sniper.io/schemas/features/blocks/integrations/openai'

type Props = {
  options: OpenAIBlock['options']
}

export const OpenAINodeBody = ({ options }: Props) => {
  const { sniper } = useSniper()

  return (
    <Stack>
      <Text color={options?.task ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {options?.task ?? 'Configure...'}
      </Text>
      {sniper &&
        options &&
        'responseMapping' in options &&
        options.responseMapping
          ?.map((mapping) => mapping.variableId)
          .map((variableId, idx) =>
            variableId ? (
              <SetVariableLabel
                key={variableId + idx}
                variables={sniper.variables}
                variableId={variableId}
              />
            ) : null
          )}
      {sniper &&
        options &&
        'saveUrlInVariableId' in options &&
        options.saveUrlInVariableId && (
          <SetVariableLabel
            variables={sniper.variables}
            variableId={options.saveUrlInVariableId}
          />
        )}
    </Stack>
  )
}
