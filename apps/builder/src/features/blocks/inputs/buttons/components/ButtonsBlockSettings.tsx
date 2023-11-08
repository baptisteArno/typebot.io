import { TextInput } from '@/components/inputs'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormControl, FormLabel, Stack } from '@chakra-ui/react'
import { ChoiceInputBlock, Variable } from '@typebot.io/schemas'
import React from 'react'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { defaultChoiceInputOptions } from '@typebot.io/schemas/features/blocks/inputs/choice/constants'

type Props = {
  options?: ChoiceInputBlock['options']
  onOptionsChange: (options: ChoiceInputBlock['options']) => void
}

export const ButtonsBlockSettings = ({ options, onOptionsChange }: Props) => {
  const updateIsMultiple = (isMultipleChoice: boolean) =>
    onOptionsChange({ ...options, isMultipleChoice })
  const updateIsSearchable = (isSearchable: boolean) =>
    onOptionsChange({ ...options, isSearchable })
  const updateButtonLabel = (buttonLabel: string) =>
    onOptionsChange({ ...options, buttonLabel })
  const updateSearchInputPlaceholder = (searchInputPlaceholder: string) =>
    onOptionsChange({ ...options, searchInputPlaceholder })
  const updateSaveVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const updateDynamicDataVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, dynamicVariableId: variable?.id })

  return (
    <Stack spacing={4}>
      <SwitchWithRelatedSettings
        label="Multiple choice?"
        initialValue={
          options?.isMultipleChoice ??
          defaultChoiceInputOptions.isMultipleChoice
        }
        onCheckChange={updateIsMultiple}
      >
        <TextInput
          label="Submit button label:"
          defaultValue={
            options?.buttonLabel ?? defaultChoiceInputOptions.buttonLabel
          }
          onChange={updateButtonLabel}
        />
      </SwitchWithRelatedSettings>
      <SwitchWithRelatedSettings
        label="Is searchable?"
        initialValue={
          options?.isSearchable ?? defaultChoiceInputOptions.isSearchable
        }
        onCheckChange={updateIsSearchable}
      >
        <TextInput
          label="Input placeholder:"
          defaultValue={
            options?.searchInputPlaceholder ??
            defaultChoiceInputOptions.searchInputPlaceholder
          }
          onChange={updateSearchInputPlaceholder}
        />
      </SwitchWithRelatedSettings>
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
