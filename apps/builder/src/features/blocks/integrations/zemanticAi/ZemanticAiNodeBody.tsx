import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'
import { ZemanticAiBlock } from '@sniper.io/schemas'

type Props = {
  options: ZemanticAiBlock['options']
}

export const ZemanticAiNodeBody = ({
  options: { query, projectId, responseMapping } = {},
}: Props) => {
  const { sniper } = useSniper()
  return (
    <Stack>
      <Text
        color={query && projectId ? 'currentcolor' : 'gray.500'}
        noOfLines={1}
      >
        {query && projectId ? `Ask: ${query}` : 'Configure...'}
      </Text>
      {sniper &&
        responseMapping
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
    </Stack>
  )
}
