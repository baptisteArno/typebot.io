import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { TextInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormLabel, Stack } from '@chakra-ui/react'
import { DateInputOptions, Variable } from '@typebot.io/schemas'
import React from 'react'

type Props = {
  options: DateInputOptions
  onOptionsChange: (options: DateInputOptions) => void
}

export const DateInputSettings = ({ options, onOptionsChange }: Props) => {
  const updateFromLabel = (from: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, from } })
  const updateToLabel = (to: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, to } })
  const updateButtonLabel = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })
  const updateIsRange = (isRange: boolean) =>
    onOptionsChange({ ...options, isRange })
  const updateHasTime = (hasTime: boolean) =>
    onOptionsChange({ ...options, hasTime })
  const updateVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const updateFormat = (format: string) => {
    if (format === '') return onOptionsChange({ ...options, format: undefined })
    onOptionsChange({ ...options, format })
  }
  const updateMin = (min: string) => {
    if (min === '') return onOptionsChange({ ...options, min: undefined })
    onOptionsChange({ ...options, min })
  }
  const updateMax = (max: string) => {
    if (max === '') return onOptionsChange({ ...options, max: undefined })
    onOptionsChange({ ...options, max })
  }

  return (
    <Stack spacing={4}>
      <SwitchWithRelatedSettings
        label="Is range?"
        initialValue={options.isRange}
        onCheckChange={updateIsRange}
      >
        <TextInput
          label="From label:"
          defaultValue={options.labels.from}
          onChange={updateFromLabel}
        />
        <TextInput
          label="To label:"
          defaultValue={options.labels.to}
          onChange={updateToLabel}
        />
      </SwitchWithRelatedSettings>
      <SwitchWithLabel
        label="With time?"
        initialValue={options.hasTime}
        onCheckChange={updateHasTime}
      />
      <TextInput
        label="Button label:"
        defaultValue={options.labels.button}
        onChange={updateButtonLabel}
      />
      <TextInput
        label="Min:"
        defaultValue={options.min}
        placeholder={options.hasTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD'}
        onChange={updateMin}
      />
      <TextInput
        label="Max:"
        defaultValue={options.max}
        placeholder={options.hasTime ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD'}
        onChange={updateMax}
      />
      <TextInput
        label="Format:"
        defaultValue={options.format}
        moreInfoTooltip="Popular formats: dd/MM/yyyy, MM/dd/yy, yyyy-MM-dd"
        placeholder={options.hasTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'}
        onChange={updateFormat}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          Save answer in a variable:
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options.variableId}
          onSelectVariable={updateVariable}
        />
      </Stack>
    </Stack>
  )
}
