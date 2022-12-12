import { FormLabel, Stack } from '@chakra-ui/react'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { NumberInputOptions, Variable } from 'models'
import React from 'react'

type NumberInputSettingsBodyProps = {
  options: NumberInputOptions
  onOptionsChange: (options: NumberInputOptions) => void
}

export const NumberInputSettingsBody = ({
  options,
  onOptionsChange,
}: NumberInputSettingsBodyProps) => {
  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({ ...options, variableId: variable?.id })
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <VariableSearchInput
          initialVariableId={options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
