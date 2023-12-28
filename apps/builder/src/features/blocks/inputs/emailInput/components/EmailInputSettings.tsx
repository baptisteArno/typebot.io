import { TextInput } from '@/components/inputs'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormLabel, Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { EmailInputBlock, Variable } from '@typebot.io/schemas'
import React from 'react'

type Props = {
  options: EmailInputBlock['options']
  onOptionsChange: (options: EmailInputBlock['options']) => void
}

export const EmailInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const handleRetryMessageChange = (retryMessageContent: string) =>
    onOptionsChange({ ...options, retryMessageContent })

  return (
    <Stack spacing={4}>
      <TextInput
        label={t('editor.blocks.inputs.settings.placeholder.label')}
        defaultValue={
          options?.labels?.placeholder ??
          t('editor.blocks.inputs.email.placeholder.label')
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
      <TextInput
        label={t('editor.blocks.inputs.settings.retryMessage.label')}
        defaultValue={
          options?.retryMessageContent ??
          t('editor.blocks.inputs.email.settings.retryMessageText.label')
        }
        onChange={handleRetryMessageChange}
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
