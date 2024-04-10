import { Stack } from '@chakra-ui/react'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
import { CpfInputOptions, Variable } from 'models'
import React from 'react'

type CpfInputSettingsBodyProps = {
  options: CpfInputOptions
  onOptionsChange: (options: CpfInputOptions) => void
}

export const CpfInputSettingsBody = ({
  options,
  onOptionsChange,
}: CpfInputSettingsBodyProps) => {
  const handleVariableChange = (variable: Variable) => {
    onOptionsChange({
      ...options,
      property: {
        domain: 'CHAT',
        name: variable.name,
        type: variable.type ? variable.type : 'string',
        token: variable.token,
      },
    })
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
