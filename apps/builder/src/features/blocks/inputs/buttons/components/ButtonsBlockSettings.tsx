import { TextInput } from '@/components/inputs'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormControl, FormLabel, Stack } from '@chakra-ui/react'
import { ChoiceInputOptions, Variable } from '@typebot.io/schemas'
import React from 'react'

type Props = {
  options?: ChoiceInputOptions
  onOptionsChange: (options: ChoiceInputOptions) => void
}

export const ButtonsBlockSettings = ({ options, onOptionsChange }: Props) => {
  const updateIsMultiple = (isMultipleChoice: boolean) =>
    options && onOptionsChange({ ...options, isMultipleChoice })
  const updateIsSearchable = (isSearchable: boolean) =>
    options && onOptionsChange({ ...options, isSearchable })
  const updateButtonLabel = (buttonLabel: string) =>
    options && onOptionsChange({ ...options, buttonLabel })
  const updateSaveVariable = (variable?: Variable) =>
    options && onOptionsChange({ ...options, variableId: variable?.id })
  const updateDynamicDataVariable = (variable?: Variable) =>
    options && onOptionsChange({ ...options, dynamicVariableId: variable?.id })

  return (
    <Stack spacing={4}>
      <SwitchWithLabel
        label="Multiple choice?"
        initialValue={options?.isMultipleChoice ?? false}
        onCheckChange={updateIsMultiple}
      />
      <SwitchWithLabel
        label="Is searchable?"
        initialValue={options?.isSearchable ?? false}
        onCheckChange={updateIsSearchable}
      />
      {options?.isMultipleChoice && (
        <TextInput
          label="Button label:"
          defaultValue={options?.buttonLabel ?? 'Send'}
          onChange={updateButtonLabel}
        />
      )}
      <FormControl>
        <FormLabel>
          Dynamic data:{' '}
          <MoreInfoTooltip>
            If defined, buttons will be dynamically displayed based on what the
            variable contains.
          </MoreInfoTooltip>
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.dynamicVariableId}
          onSelectVariable={updateDynamicDataVariable}
        />
      </FormControl>
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          Save answer in a variable:
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={updateSaveVariable}
        />
      </Stack>
    </Stack>
  )
}
