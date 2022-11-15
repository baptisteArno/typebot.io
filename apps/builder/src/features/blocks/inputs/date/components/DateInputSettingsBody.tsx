import { Input } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/SwitchWithLabel'
import { VariableSearchInput } from '@/components/VariableSearchInput'
import { FormLabel, Stack } from '@chakra-ui/react'
import { DateInputOptions, Variable } from 'models'
import React from 'react'

type DateInputSettingsBodyProps = {
  options: DateInputOptions
  onOptionsChange: (options: DateInputOptions) => void
}

export const DateInputSettingsBody = ({
  options,
  onOptionsChange,
}: DateInputSettingsBodyProps) => {
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
        <Stack>
          <FormLabel mb="0" htmlFor="from">
            From label:
          </FormLabel>
          <Input
            id="from"
            defaultValue={options.labels.from}
            onChange={handleFromChange}
          />
        </Stack>
      )}
      {options?.isRange && (
        <Stack>
          <FormLabel mb="0" htmlFor="to">
            To label:
          </FormLabel>
          <Input
            id="to"
            defaultValue={options.labels.to}
            onChange={handleToChange}
          />
        </Stack>
      )}
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Button label:
        </FormLabel>
        <Input
          id="button"
          defaultValue={options.labels.button}
          onChange={handleButtonLabelChange}
        />
      </Stack>
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
