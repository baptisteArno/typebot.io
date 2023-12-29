import { TextInput } from '@/components/inputs'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormLabel, Stack } from '@chakra-ui/react'
import { Variable } from '@typebot.io/schemas'
import React from 'react'
import { PictureChoiceBlock } from '@typebot.io/schemas/features/blocks/inputs/pictureChoice'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { defaultPictureChoiceOptions } from '@typebot.io/schemas/features/blocks/inputs/pictureChoice/constants'
import { useTranslate } from '@tolgee/react'

type Props = {
  options?: PictureChoiceBlock['options']
  onOptionsChange: (options: PictureChoiceBlock['options']) => void
}

export const PictureChoiceSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()

  const updateIsMultiple = (isMultipleChoice: boolean) =>
    onOptionsChange({ ...options, isMultipleChoice })
  const updateButtonLabel = (buttonLabel: string) =>
    onOptionsChange({ ...options, buttonLabel })
  const updateSaveVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const updateSearchInputPlaceholder = (searchInputPlaceholder: string) =>
    onOptionsChange({ ...options, searchInputPlaceholder })
  const updateIsSearchable = (isSearchable: boolean) =>
    onOptionsChange({ ...options, isSearchable })

  const updateIsDynamicItemsEnabled = (isEnabled: boolean) =>
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options?.dynamicItems,
        isEnabled,
      },
    })

  const updateDynamicItemsPictureSrcsVariable = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options?.dynamicItems,
        pictureSrcsVariableId: variable?.id,
      },
    })

  const updateDynamicItemsTitlesVariable = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options?.dynamicItems,
        titlesVariableId: variable?.id,
      },
    })

  const updateDynamicItemsDescriptionsVariable = (variable?: Variable) =>
    onOptionsChange({
      ...options,
      dynamicItems: {
        ...options?.dynamicItems,
        descriptionsVariableId: variable?.id,
      },
    })

  return (
    <Stack spacing={4}>
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.settings.isSearchable.label')}
        initialValue={
          options?.isSearchable ?? defaultPictureChoiceOptions.isSearchable
        }
        onCheckChange={updateIsSearchable}
      >
        <TextInput
          label={t('blocks.inputs.settings.input.placeholder.label')}
          defaultValue={
            options?.searchInputPlaceholder ??
            defaultPictureChoiceOptions.searchInputPlaceholder
          }
          onChange={updateSearchInputPlaceholder}
        />
      </SwitchWithRelatedSettings>
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.settings.multipleChoice.label')}
        initialValue={
          options?.isMultipleChoice ??
          defaultPictureChoiceOptions.isMultipleChoice
        }
        onCheckChange={updateIsMultiple}
      >
        <TextInput
          label={t('blocks.inputs.settings.submitButton.label')}
          defaultValue={
            options?.buttonLabel ?? defaultPictureChoiceOptions.buttonLabel
          }
          onChange={updateButtonLabel}
        />
      </SwitchWithRelatedSettings>

      <SwitchWithRelatedSettings
        label={t('blocks.inputs.picture.settings.dynamicItems.label')}
        initialValue={
          options?.dynamicItems?.isEnabled ??
          defaultPictureChoiceOptions.dynamicItems.isEnabled
        }
        onCheckChange={updateIsDynamicItemsEnabled}
      >
        <Stack>
          <FormLabel mb="0" htmlFor="variable">
            {t('blocks.inputs.picture.settings.dynamicItems.images.label')}
          </FormLabel>
          <VariableSearchInput
            initialVariableId={options?.dynamicItems?.pictureSrcsVariableId}
            onSelectVariable={updateDynamicItemsPictureSrcsVariable}
          />
        </Stack>
        <Stack>
          <FormLabel mb="0" htmlFor="variable">
            {t('blocks.inputs.picture.settings.dynamicItems.titles.label')}
          </FormLabel>
          <VariableSearchInput
            initialVariableId={options?.dynamicItems?.titlesVariableId}
            onSelectVariable={updateDynamicItemsTitlesVariable}
          />
        </Stack>
        <Stack>
          <FormLabel mb="0" htmlFor="variable">
            {t(
              'blocks.inputs.picture.settings.dynamicItems.descriptions.label'
            )}
          </FormLabel>
          <VariableSearchInput
            initialVariableId={options?.dynamicItems?.descriptionsVariableId}
            onSelectVariable={updateDynamicItemsDescriptionsVariable}
          />
        </Stack>
      </SwitchWithRelatedSettings>

      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          {t('blocks.inputs.settings.saveAnswer.label')}
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={updateSaveVariable}
        />
      </Stack>
    </Stack>
  )
}
