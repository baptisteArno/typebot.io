import { FormLabel, Stack } from '@chakra-ui/react'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { Input } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput/VariableSearchInput'
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
        id="is-range"
        label={'É uma janela?'}
        initialValue={options.isRange}
        onCheckChange={handleIsRangeChange}
      />
      <SwitchWithLabel
        id="with-time"
        label={'Com horário?'}
        initialValue={options.isRange}
        onCheckChange={handleHasTimeChange}
      />
      {options.isRange && (
        <Stack>
          <FormLabel mb="0" htmlFor="from">
            Começo janela:
          </FormLabel>
          <Input
            id="from"
            value={options.labels.from}
            defaultValue={options.labels.from}
            onChange={handleFromChange}
          />
        </Stack>
      )}
      {options?.isRange && (
        <Stack>
          <FormLabel mb="0" htmlFor="to">
            Final janela:
          </FormLabel>
          <Input
            id="to"
            value={options.labels.to}
            defaultValue={options.labels.to}
            onChange={handleToChange}
          />
        </Stack>
      )}
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Mensagem do botão:
        </FormLabel>
        <Input
          id="button"
          value={options.labels.button}
          defaultValue={options.labels.button}
          onChange={handleButtonLabelChange}
        />
      </Stack>
      <Stack>
        <VariableSearchInput
          initialVariableId={options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
