import { FormLabel, Stack } from '@chakra-ui/react'
import { Input } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput'
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
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          Salvar resposta em uma variável:
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
