import { FormLabel, Stack } from '@chakra-ui/react'
import { Textarea } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput'
import { SetVariableOptions, Variable } from 'models'
import React from 'react'

type Props = {
  options: SetVariableOptions
  onOptionsChange: (options: SetVariableOptions) => void
}

export const SetVariableSettings = ({ options, onOptionsChange }: Props) => {
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
        <Textarea
          id="expression"
          defaultValue={options.expressionToEvaluate ?? ''}
          onChange={handleExpressionChange}
        />
      </Stack>
    </Stack>
  )
}
