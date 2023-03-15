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
  const handleFromChange = (from: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, from } })
  const handleToChange = (to: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, to } })
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })
  const handleIsRangeChange = (isRange: boolean) =>
    onOptionsChange({ ...options, isRange })
  const handleHasTimeChange = (hasTime: boolean) =>
    onOptionsChange({ ...options, hasTime })
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

  return (
    <Stack spacing={4}>
      <SwitchWithLabel
        label="Is range?"
        initialValue={options.isRange}
        onCheckChange={handleIsRangeChange}
      />
      <SwitchWithLabel
        label="With time?"
        initialValue={options.isRange}
        onCheckChange={handleHasTimeChange}
      />
      {options.isRange && (
        <>
          <TextInput
            label="From label:"
            defaultValue={options.labels.from}
            onChange={handleFromChange}
          />
          <TextInput
            label="To label:"
            defaultValue={options.labels.to}
            onChange={handleToChange}
          />
        </>
      )}
      <TextInput
        label="Button label:"
        defaultValue={options.labels.button}
        onChange={handleButtonLabelChange}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          Save answer in a variable:
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
