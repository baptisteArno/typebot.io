import { FormLabel, Stack } from '@chakra-ui/react'
import { DebouncedTextarea } from 'components/shared/DebouncedTextarea'
import { VariableSearchInput } from 'components/shared/VariableSearchInput'
import { SetVariableOptions, Variable } from 'models'
import React from 'react'

type Props = {
  options: SetVariableOptions
  onOptionsChange: (options: SetVariableOptions) => void
}

export const SetVariableSettingsBody = ({
  options,
  onOptionsChange,
}: Props) => {
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const handleExpressionChange = (expressionToEvaluate: string) =>
    onOptionsChange({ ...options, expressionToEvaluate })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="variable-search">
          Search or create variable:
        </FormLabel>
        <VariableSearchInput
          onSelectVariable={handleVariableChange}
          initialVariableId={options.variableId}
          id="variable-search"
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="expression">
          Value / Expression:
        </FormLabel>
        <DebouncedTextarea
          id="expression"
          initialValue={options.expressionToEvaluate ?? ''}
          delay={100}
          onChange={handleExpressionChange}
        />
      </Stack>
    </Stack>
  )
}
