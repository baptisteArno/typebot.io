import { FormLabel, Stack } from '@chakra-ui/react'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { Input } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { ChoiceInputOptions, Variable } from 'models'
import React from 'react'

type ChoiceInputSettingsBodyProps = {
  options?: ChoiceInputOptions
  onOptionsChange: (options: ChoiceInputOptions) => void
}

export const ChoiceInputSettingsBody = ({
  options,
  onOptionsChange,
}: ChoiceInputSettingsBodyProps) => {
  const handleVariableChange = (variable?: Variable) =>
    options && onOptionsChange({ ...options, variableId: variable?.id })

  return (
    <Stack spacing={4}>
      <Stack>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
