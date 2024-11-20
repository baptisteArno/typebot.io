import { TextInput } from '@/components/inputs'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormControl, FormLabel, Stack } from '@chakra-ui/react'
import { ChoiceInputBlock, Variable } from '@typebot.io/schemas'
import React from 'react'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import {
  defaultChoiceInputOptions,
  interactiveButtonType,
  interactiveButtonTypes,
} from '@typebot.io/schemas/features/blocks/inputs/choice/constants'
import { useTranslate } from '@tolgee/react'
import { ButtonsBlockInteractiveSettings } from './ButtonsBlockInteractiveSettings'
import { RadioButtons } from '../../../../../components/inputs/RadioButtons'

type Props = {
  options?: ChoiceInputBlock['options']
  onOptionsChange: (options: ChoiceInputBlock['options']) => void
}

export const ButtonsBlockSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()
  const updateIsMultiple = (isMultipleChoice: boolean) =>
    onOptionsChange({ ...options, isMultipleChoice })
  const updateIsSearchable = (isSearchable: boolean) =>
    onOptionsChange({ ...options, isSearchable })
  const updateIsInteractive = (isInteractive: boolean) =>
    onOptionsChange({
      ...options,
      isInteractive,
      interactiveButtonType:
        options?.interactiveButtonType || interactiveButtonType.REPLY,
    })
  const updateInteractiveButtonType = (
    interactiveButtonType: interactiveButtonType
  ) => onOptionsChange({ ...options, interactiveButtonType })
  const updateButtonLabel = (buttonLabel: string) =>
    onOptionsChange({ ...options, buttonLabel })
  const updateSearchInputPlaceholder = (searchInputPlaceholder: string) =>
    onOptionsChange({ ...options, searchInputPlaceholder })
  const updateSaveVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const updateDynamicDataVariable = (variable?: Variable) =>
    onOptionsChange({ ...options, dynamicVariableId: variable?.id })

  return (
    <Stack spacing={4}>
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.settings.multipleChoice.label')}
        initialValue={
          options?.isMultipleChoice ??
          defaultChoiceInputOptions.isMultipleChoice
        }
        onCheckChange={updateIsMultiple}
      >
        <TextInput
          label={t('blocks.inputs.settings.submitButton.label')}
          defaultValue={
            options?.buttonLabel ?? t('blocks.inputs.settings.buttonText.label')
          }
          onChange={updateButtonLabel}
        />
      </SwitchWithRelatedSettings>
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.settings.isSearchable.label')}
        initialValue={
          options?.isSearchable ?? defaultChoiceInputOptions.isSearchable
        }
        onCheckChange={updateIsSearchable}
      >
        <TextInput
          label={t('blocks.inputs.settings.input.placeholder.label')}
          defaultValue={
            options?.searchInputPlaceholder ??
            t('blocks.inputs.settings.input.filterOptions.label')
          }
          onChange={updateSearchInputPlaceholder}
        />
      </SwitchWithRelatedSettings>
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.settings.interactiveButton.label')}
        initialValue={
          options?.isInteractive ?? defaultChoiceInputOptions.isInteractive
        }
        onCheckChange={updateIsInteractive}
      >
        <RadioButtons
          size="sm"
          defaultValue={defaultChoiceInputOptions.interactiveButtonType}
          options={interactiveButtonTypes.map(
            (type: interactiveButtonType) => ({
              value: type,
              label: t(
                'blocks.inputs.settings.interactive.interactiveType.' + type
              ),
            })
          )}
          onSelect={updateInteractiveButtonType}
        />
        <ButtonsBlockInteractiveSettings
          options={options}
          onOptionsChange={onOptionsChange}
        />
      </SwitchWithRelatedSettings>
      <FormControl>
        <FormLabel>
          {t('blocks.inputs.button.settings.dynamicData.label')}{' '}
          <MoreInfoTooltip>
            {t('blocks.inputs.button.settings.dynamicData.infoText.label')}
          </MoreInfoTooltip>
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.dynamicVariableId}
          onSelectVariable={updateDynamicDataVariable}
        />
      </FormControl>
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
