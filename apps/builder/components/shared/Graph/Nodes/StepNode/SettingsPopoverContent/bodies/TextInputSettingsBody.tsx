import { FormLabel, Stack } from '@chakra-ui/react'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { Input } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { TextInputOptions, Variable } from 'models'
import React from 'react'

type TextInputSettingsBodyProps = {
  options: TextInputOptions
  onOptionsChange: (options: TextInputOptions) => void
}

export const TextInputSettingsBody = ({
  options,
  onOptionsChange,
}: TextInputSettingsBodyProps) => {
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

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
