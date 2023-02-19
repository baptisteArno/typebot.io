import { FormLabel, HStack, Stack, Text } from '@chakra-ui/react'
import { CodeEditor } from '@/components/CodeEditor'
import { FileInputOptions, Variable } from 'models'
import React from 'react'
import { Input, SmartNumberInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/SwitchWithLabel'
import { VariableSearchInput } from '@/components/VariableSearchInput'

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

  const updateClearButtonLabel = (clear: string) =>
    onOptionsChange({ ...options, labels: { ...options.labels, clear } })

  const updateSkipButtonLabel = (skip: string) =>
    onOptionsChange({ ...options, labels: { ...options.labels, skip } })

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
      <HStack>
        <SmartNumberInput
          label={'Size limit:'}
          defaultValue={options.sizeLimit ?? 10}
          onValueChange={handleSizeLimitChange}
          withVariableButton={false}
        />
        <Text>MB</Text>
      </HStack>

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
      <Input
        label="Button label:"
        defaultValue={options.labels.button}
        onChange={handleButtonLabelChange}
        withVariableButton={false}
      />
      <Input
        label="Clear button label:"
        defaultValue={options.labels.clear}
        onChange={updateClearButtonLabel}
        withVariableButton={false}
      />
      <Input
        label="Skip button label:"
        defaultValue={options.labels.skip}
        onChange={updateSkipButtonLabel}
        withVariableButton={false}
      />
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
