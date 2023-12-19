import { TextInput, NumberInput } from '@/components/inputs'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormLabel, Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { NumberInputBlock, Variable } from '@typebot.io/schemas'
import React from 'react'

type Props = {
  options: NumberInputBlock['options']
  onOptionsChange: (options: NumberInputBlock['options']) => void
}

export const NumberInputSettings = ({ options, onOptionsChange }: Props) => {
	const { t } = useTranslate()
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })
  const handleMinChange = (
    min?: NonNullable<NumberInputBlock['options']>['min']
  ) => onOptionsChange({ ...options, min })
  const handleMaxChange = (
    max?: NonNullable<NumberInputBlock['options']>['max']
  ) => onOptionsChange({ ...options, max })
  const handleStepChange = (
    step?: NonNullable<NumberInputBlock['options']>['step']
  ) => onOptionsChange({ ...options, step })
  const handleVariableChange = (variable?: Variable) => {
    onOptionsChange({ ...options, variableId: variable?.id })
  }

  return (
    <Stack spacing={4}>
      <TextInput
        label={t("editor.blocks.inputs.settings.placeholder.label")}
        defaultValue={
          options?.labels?.placeholder ??
	          t("editor.blocks.inputs.number.placeholder.label")
        }
        onChange={handlePlaceholderChange}
      />
      <TextInput
        label={t("editor.blocks.inputs.settings.button.label")}
        defaultValue={
          options?.labels?.button ?? t("editor.blocks.inputs.settings.buttonText.label")
        }
        onChange={handleButtonLabelChange}
      />
      <NumberInput
        label={t("editor.blocks.inputs.settings.min.label")}
        defaultValue={options?.min}
        onValueChange={handleMinChange}
      />
      <NumberInput
        label={t("editor.blocks.inputs.settings.max.label")}
        defaultValue={options?.max}
        onValueChange={handleMaxChange}
      />
      <NumberInput
        label={t("editor.blocks.inputs.number.settings.step.label")}
        defaultValue={options?.step}
        onValueChange={handleStepChange}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {t("editor.blocks.inputs.settings.saveAnswer.label")}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
