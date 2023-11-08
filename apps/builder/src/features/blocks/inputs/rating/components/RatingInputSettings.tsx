import { FormLabel, Stack } from '@chakra-ui/react'
import { DropdownList } from '@/components/DropdownList'
import { RatingInputBlock, Variable } from '@typebot.io/schemas'
import React from 'react'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { TextInput } from '@/components/inputs'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { defaultRatingInputOptions } from '@typebot.io/schemas/features/blocks/inputs/rating/constants'

type Props = {
  options: RatingInputBlock['options']
  onOptionsChange: (options: RatingInputBlock['options']) => void
}

export const RatingInputSettings = ({ options, onOptionsChange }: Props) => {
  const handleLengthChange = (length: number) =>
    onOptionsChange({ ...options, length })

  const handleTypeChange = (buttonType: 'Icons' | 'Numbers') =>
    onOptionsChange({ ...options, buttonType })

  const handleCustomIconCheck = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      customIcon: { ...options?.customIcon, isEnabled },
    })

  const handleIconSvgChange = (svg: string) =>
    onOptionsChange({ ...options, customIcon: { ...options?.customIcon, svg } })

  const handleLeftLabelChange = (left: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, left } })

  const handleRightLabelChange = (right: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, right } })

  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })

  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })

  const handleOneClickSubmitChange = (isOneClickSubmitEnabled: boolean) =>
    onOptionsChange({ ...options, isOneClickSubmitEnabled })

  const length = options?.length ?? defaultRatingInputOptions.length
  const isOneClickSubmitEnabled =
    options?.isOneClickSubmitEnabled ??
    defaultRatingInputOptions.isOneClickSubmitEnabled

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Maximum:
        </FormLabel>
        <DropdownList
          onItemSelect={handleLengthChange}
          items={[3, 4, 5, 6, 7, 8, 9, 10]}
          currentItem={length}
        />
      </Stack>

      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Type:
        </FormLabel>
        <DropdownList
          onItemSelect={handleTypeChange}
          items={['Icons', 'Numbers'] as const}
          currentItem={
            options?.buttonType ?? defaultRatingInputOptions.buttonType
          }
        />
      </Stack>

      {options?.buttonType === 'Icons' && (
        <SwitchWithLabel
          label="Custom icon?"
          initialValue={
            options?.customIcon?.isEnabled ??
            defaultRatingInputOptions.customIcon.isEnabled
          }
          onCheckChange={handleCustomIconCheck}
        />
      )}
      {options?.buttonType === 'Icons' && options.customIcon?.isEnabled && (
        <TextInput
          label="Icon SVG:"
          defaultValue={options.customIcon.svg}
          onChange={handleIconSvgChange}
          placeholder="<svg>...</svg>"
        />
      )}
      <TextInput
        label={`${options?.buttonType === 'Icons' ? '1' : '0'} label:`}
        defaultValue={options?.labels?.left}
        onChange={handleLeftLabelChange}
        placeholder="Not likely at all"
      />
      <TextInput
        label={`${length} label:`}
        defaultValue={options?.labels?.right}
        onChange={handleRightLabelChange}
        placeholder="Extremely likely"
      />
      <SwitchWithLabel
        label="One click submit"
        moreInfoContent='If enabled, the answer will be submitted as soon as the user clicks on a rating instead of showing the "Send" button.'
        initialValue={isOneClickSubmitEnabled}
        onCheckChange={handleOneClickSubmitChange}
      />
      {!isOneClickSubmitEnabled && (
        <TextInput
          label="Button label:"
          defaultValue={
            options?.labels?.button ?? defaultRatingInputOptions.labels.button
          }
          onChange={handleButtonLabelChange}
        />
      )}
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          Save answer in a variable:
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
