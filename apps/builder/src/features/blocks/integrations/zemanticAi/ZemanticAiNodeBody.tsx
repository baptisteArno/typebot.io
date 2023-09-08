import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { ZemanticAiOptions } from '@typebot.io/schemas'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'

type Props = {
  options: ZemanticAiOptions
}

export const ZemanticAiNodeBody = ({
  options: { query, projectId, responseMapping },
}: Props) => {
  const { typebot } = useTypebot()
  return (
    <Stack>
      <Text
        color={query && projectId ? 'currentcolor' : 'gray.500'}
        noOfLines={1}
      >
        {query && projectId ? `Ask: ${query}` : 'Configure...'}
      </Text>
      {typebot &&
        responseMapping
          .map((mapping) => mapping.variableId)
          .map((variableId, idx) =>
            variableId ? (
              <SetVariableLabel
                key={variableId + idx}
                variables={typebot.variables}
                variableId={variableId}
              />
            ) : null
          )}
    </Stack>
  )
}
