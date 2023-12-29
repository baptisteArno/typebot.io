import { FormLabel, Stack } from '@chakra-ui/react'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { FileInputBlock, Variable } from '@typebot.io/schemas'
import React from 'react'
import { TextInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { defaultFileInputOptions } from '@typebot.io/schemas/features/blocks/inputs/file/constants'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: FileInputBlock['options']
  onOptionsChange: (options: FileInputBlock['options']) => void
}

export const FileInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()

  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })

  const handlePlaceholderLabelChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })

  const handleMultipleFilesChange = (isMultipleAllowed: boolean) =>
    onOptionsChange({ ...options, isMultipleAllowed })

  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

  const handleRequiredChange = (isRequired: boolean) =>
    onOptionsChange({ ...options, isRequired })

  const updateClearButtonLabel = (clear: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, clear } })

  const updateSkipButtonLabel = (skip: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, skip } })

  return (
    <Stack spacing={4}>
      <SwitchWithLabel
        label={t('blocks.inputs.file.settings.required.label')}
        initialValue={options?.isRequired ?? defaultFileInputOptions.isRequired}
        onCheckChange={handleRequiredChange}
      />
      <SwitchWithLabel
        label={t('blocks.inputs.file.settings.allowMultiple.label')}
        initialValue={
          options?.isMultipleAllowed ??
          defaultFileInputOptions.isMultipleAllowed
        }
        onCheckChange={handleMultipleFilesChange}
      />
      <Stack>
        <FormLabel mb="0">
          {t('blocks.inputs.settings.placeholder.label')}
        </FormLabel>
        <CodeEditor
          lang="html"
          onChange={handlePlaceholderLabelChange}
          defaultValue={
            options?.labels?.placeholder ??
            defaultFileInputOptions.labels.placeholder
          }
          height={'100px'}
          withVariableButton={false}
        />
      </Stack>
      <TextInput
        label={t('blocks.inputs.settings.button.label')}
        defaultValue={
          options?.labels?.button ?? defaultFileInputOptions.labels.button
        }
        onChange={handleButtonLabelChange}
        withVariableButton={false}
      />
      <TextInput
        label={t('blocks.inputs.file.settings.clear.label')}
        defaultValue={
          options?.labels?.clear ?? defaultFileInputOptions.labels.clear
        }
        onChange={updateClearButtonLabel}
        withVariableButton={false}
      />
      <TextInput
        label={t('blocks.inputs.file.settings.skip.label')}
        defaultValue={
          options?.labels?.skip ?? defaultFileInputOptions.labels.skip
        }
        onChange={updateSkipButtonLabel}
        withVariableButton={false}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {options?.isMultipleAllowed
            ? t('blocks.inputs.file.settings.saveMultipleUpload.label')
            : t('blocks.inputs.file.settings.saveSingleUpload.label')}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
