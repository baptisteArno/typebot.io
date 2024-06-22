import React from 'react'
import { Stack, Text } from '@chakra-ui/react'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { SetVariableLabel } from '@/components/SetVariableLabel'
import { GoogleSheetsBlock } from '@sniper.io/schemas'
import { GoogleSheetsAction } from '@sniper.io/schemas/features/blocks/integrations/googleSheets/constants'

type Props = {
  options?: GoogleSheetsBlock['options']
}

export const GoogleSheetsNodeContent = ({ options }: Props) => {
  const { sniper } = useSniper()
  return (
    <Stack>
      <Text color={options?.action ? 'currentcolor' : 'gray.500'} noOfLines={1}>
        {options?.action ?? 'Configure...'}
      </Text>
      {sniper &&
        options?.action === GoogleSheetsAction.GET &&
        options?.cellsToExtract
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
