import { TextInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormLabel, Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { TextInputBlock, Variable } from '@typebot.io/schemas'
import { defaultTextInputOptions } from '@typebot.io/schemas/features/blocks/inputs/text/constants'
import React from 'react'

type Props = {
  options: TextInputBlock['options']
  onOptionsChange: (options: TextInputBlock['options']) => void
}

export const TextInputSettings = ({ options, onOptionsChange }: Props) => {
	const { t } = useTranslate()
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })
  const handleLongChange = (isLong: boolean) =>
    onOptionsChange({ ...options, isLong })
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

  return (
    <Stack spacing={4}>
      <SwitchWithLabel
        label={t("blocks.inputs.text.settings.longText.label")}
        initialValue={options?.isLong ?? defaultTextInputOptions.isLong}
        onCheckChange={handleLongChange}
      />
      <TextInput
        label={t("blocks.inputs.text.settings.placeholder.label")}
        defaultValue={
          options?.labels?.placeholder ??
	          t("blocks.inputs.text.placeholder.label")
        }
        onChange={handlePlaceholderChange}
      />
      <TextInput
        label={t("blocks.inputs.text.settings.button.label")}
        defaultValue={
          options?.labels?.button ?? t("blocks.inputs.text.settings.buttonText.label")
        }
        onChange={handleButtonLabelChange}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
					{t("blocks.inputs.text.settings.saveAnswer.label")}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
