import { FormLabel, Stack } from '@chakra-ui/react'
import { CodeEditor } from 'components/shared/CodeEditor'
import { SmartNumberInput } from 'components/shared/SmartNumberInput'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { Input } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput'
import { FileInputOptions, Variable } from 'models'
import React from 'react'

type Props = {
  options: FileInputOptions
  onOptionsChange: (options: FileInputOptions) => void
}

export const FileInputSettings = ({ options, onOptionsChange }: Props) => {
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options.labels, button } })
  const handlePlaceholderLabelChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options.labels, placeholder } })
  const handleMultipleFilesChange = (isMultipleAllowed: boolean) =>
    onOptionsChange({ ...options, isMultipleAllowed })
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const handleSizeLimitChange = (sizeLimit?: number) =>
    onOptionsChange({ ...options, sizeLimit })
  const handleRequiredChange = (isRequired: boolean) =>
    onOptionsChange({ ...options, isRequired })
  return (
    <Stack spacing={4}>
      <SwitchWithLabel
        label="Required?"
        initialValue={options.isRequired ?? true}
        onCheckChange={handleRequiredChange}
      />
      <SwitchWithLabel
        label="Allow multiple files?"
        initialValue={options.isMultipleAllowed}
        onCheckChange={handleMultipleFilesChange}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="limit">
          Size limit (MB):
        </FormLabel>
        <SmartNumberInput
          id="limit"
          value={options.sizeLimit ?? 10}
          onValueChange={handleSizeLimitChange}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0">Placeholder:</FormLabel>
        <CodeEditor
          lang="html"
          onChange={handlePlaceholderLabelChange}
          value={options.labels.placeholder}
          height={'100px'}
          withVariableButton={false}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Button label:
        </FormLabel>
        <Input
          id="button"
          defaultValue={options.labels.button}
          onChange={handleButtonLabelChange}
          withVariableButton={false}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          Save upload URL{options.isMultipleAllowed ? 's' : ''} in a variable:
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
