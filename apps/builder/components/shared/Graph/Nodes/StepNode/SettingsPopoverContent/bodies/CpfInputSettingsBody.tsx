import { FormLabel, Stack } from '@chakra-ui/react'
import OctaButton from 'components/octaComponents/OctaButton/OctaButton'
import { Input } from 'components/shared/Textbox'
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
    console.log({
      ...options,
      variableId: variable.id,
      token: variable.token,
      name: variable.name,
      type: variable.type,
      domain: variable.domain,
      example: variable.example,
    })
    onOptionsChange({
      ...options,
      variableId: variable.id,
      token: variable.token,
      name: variable.name,
      type: variable.type,
      domain: variable.domain,
      example: variable.example,
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
