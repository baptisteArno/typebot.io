import { TextInput } from '@/components/inputs'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormLabel, Stack } from '@chakra-ui/react'
import { Variable } from '@typebot.io/schemas'
import React from 'react'
import {
  PictureChoiceBlock,
  defaultPictureChoiceOptions,
} from '@typebot.io/schemas/features/blocks/inputs/pictureChoice'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'

type Props = {
  options?: PictureChoiceBlock['options']
  onOptionsChange: (options: PictureChoiceBlock['options']) => void
}

export const PictureChoiceSettings = ({ options, onOptionsChange }: Props) => {
  const updateIsMultiple = (isMultipleChoice: boolean) =>
    options && onOptionsChange({ ...options, isMultipleChoice })
  const updateButtonLabel = (buttonLabel: string) =>
    options && onOptionsChange({ ...options, buttonLabel })
  const updateSaveVariable = (variable?: Variable) =>
    options && onOptionsChange({ ...options, variableId: variable?.id })
  const updateSearchInputPlaceholder = (searchInputPlaceholder: string) =>
    options && onOptionsChange({ ...options, searchInputPlaceholder })
  const updateIsSearchable = (isSearchable: boolean) =>
    options && onOptionsChange({ ...options, isSearchable })

  const updateIsDynamicItemsEnabled = (isEnabled: boolean) =>
    options &&
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options.dynamicItems,
        isEnabled,
      },
    })

  const updateDynamicItemsPictureSrcsVariable = (variable?: Variable) =>
    options &&
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options.dynamicItems,
        pictureSrcsVariableId: variable?.id,
      },
    })

  const updateDynamicItemsTitlesVariable = (variable?: Variable) =>
    options &&
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options.dynamicItems,
        titlesVariableId: variable?.id,
      },
    })

  const updateDynamicItemsDescriptionsVariable = (variable?: Variable) =>
    options &&
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options.dynamicItems,
        descriptionsVariableId: variable?.id,
      },
    })

  return (
    <Stack spacing={4}>
      <SwitchWithRelatedSettings
        label="Is searchable?"
        initialValue={options?.isSearchable ?? false}
        onCheckChange={updateIsSearchable}
      >
        <TextInput
          label="Input placeholder:"
          defaultValue={
            options?.searchInputPlaceholder ??
            defaultPictureChoiceOptions.searchInputPlaceholder
          }
          onChange={updateSearchInputPlaceholder}
        />
      </SwitchWithRelatedSettings>
      <SwitchWithRelatedSettings
        label="Multiple choice?"
        initialValue={options?.isMultipleChoice ?? false}
        onCheckChange={updateIsMultiple}
      >
        <TextInput
          label="Submit button label:"
          defaultValue={options?.buttonLabel ?? 'Send'}
          onChange={updateButtonLabel}
        />
      </SwitchWithRelatedSettings>

      <SwitchWithRelatedSettings
        label="Dynamic items?"
        initialValue={options?.dynamicItems?.isEnabled ?? false}
        onCheckChange={updateIsDynamicItemsEnabled}
      >
        <Stack>
          <FormLabel mb="0" htmlFor="variable">
            Images:
          </FormLabel>
          <VariableSearchInput
            initialVariableId={options?.dynamicItems?.pictureSrcsVariableId}
            onSelectVariable={updateDynamicItemsPictureSrcsVariable}
          />
        </Stack>
        <Stack>
          <FormLabel mb="0" htmlFor="variable">
            Titles:
          </FormLabel>
          <VariableSearchInput
            initialVariableId={options?.dynamicItems?.titlesVariableId}
            onSelectVariable={updateDynamicItemsTitlesVariable}
          />
        </Stack>
        <Stack>
          <FormLabel mb="0" htmlFor="variable">
            Descriptions:
          </FormLabel>
          <VariableSearchInput
            initialVariableId={options?.dynamicItems?.descriptionsVariableId}
            onSelectVariable={updateDynamicItemsDescriptionsVariable}
          />
        </Stack>
      </SwitchWithRelatedSettings>

      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          Save answer in a variable:
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={updateSaveVariable}
        />
      </Stack>
    </Stack>
  )
}
