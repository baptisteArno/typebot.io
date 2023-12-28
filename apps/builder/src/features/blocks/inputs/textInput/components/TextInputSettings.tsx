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
        label={t('editor.blocks.inputs.text.settings.longText.label')}
        initialValue={options?.isLong ?? defaultTextInputOptions.isLong}
        onCheckChange={handleLongChange}
      />
      <TextInput
        label={t('editor.blocks.inputs.settings.placeholder.label')}
        defaultValue={
          options?.labels?.placeholder ??
          t('editor.blocks.inputs.text.placeholder.label')
        }
        onChange={handlePlaceholderChange}
      />
      <TextInput
        label={t('editor.blocks.inputs.settings.button.label')}
        defaultValue={
          options?.labels?.button ??
          t('editor.blocks.inputs.settings.buttonText.label')
        }
        onChange={handleButtonLabelChange}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {t('editor.blocks.inputs.settings.saveAnswer.label')}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
