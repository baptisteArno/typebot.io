import { FormLabel, Stack } from '@chakra-ui/react'
import { DropdownList } from '@/components/DropdownList'
import { RatingInputBlock, Variable } from '@typebot.io/schemas'
import React from 'react'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { TextInput } from '@/components/inputs'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { defaultRatingInputOptions } from '@typebot.io/schemas/features/blocks/inputs/rating/constants'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: RatingInputBlock['options']
  onOptionsChange: (options: RatingInputBlock['options']) => void
}

export const RatingInputSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()

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
          {t('editor.blocks.inputs.rating.settings.maximum.label')}
        </FormLabel>
        <DropdownList
          onItemSelect={handleLengthChange}
          items={[3, 4, 5, 6, 7, 8, 9, 10]}
          currentItem={length}
        />
      </Stack>

      <Stack>
        <FormLabel mb="0" htmlFor="button">
          {t('editor.blocks.inputs.rating.settings.type.label')}
        </FormLabel>
        <DropdownList
          onItemSelect={handleTypeChange}
          items={['Icons', 'Numbers'] as const}
          currentItem={
            options?.buttonType ??
            (t(
              'components.dropdownList.item.Numbers',
              defaultRatingInputOptions.buttonType
            ) as 'Numbers')
          }
        />
      </Stack>

      {options?.buttonType === 'Icons' && (
        <SwitchWithLabel
          label={t('editor.blocks.inputs.rating.settings.customIcon.label')}
          initialValue={
            options?.customIcon?.isEnabled ??
            defaultRatingInputOptions.customIcon.isEnabled
          }
          onCheckChange={handleCustomIconCheck}
        />
      )}
      {options?.buttonType === 'Icons' && options.customIcon?.isEnabled && (
        <TextInput
          label={t('editor.blocks.inputs.rating.settings.iconSVG.label')}
          defaultValue={options.customIcon.svg}
          onChange={handleIconSvgChange}
          placeholder="<svg>...</svg>"
        />
      )}
      <TextInput
        label={t('editor.blocks.inputs.rating.settings.rateLabel.label', {
          rate: options?.buttonType === 'Icons' ? '1' : '0',
        })}
        defaultValue={options?.labels?.left}
        onChange={handleLeftLabelChange}
        placeholder={t(
          'editor.blocks.inputs.rating.settings.notLikely.placeholder.label'
        )}
      />
      <TextInput
        label={t('editor.blocks.inputs.rating.settings.rateLabel.label', {
          rate: length,
        })}
        defaultValue={options?.labels?.right}
        onChange={handleRightLabelChange}
        placeholder={t(
          'editor.blocks.inputs.rating.settings.extremelyLikely.placeholder.label'
        )}
      />
      <SwitchWithLabel
        label={t('editor.blocks.inputs.rating.settings.oneClickSubmit.label')}
        moreInfoContent={t(
          'editor.blocks.inputs.rating.settings.oneClickSubmit.infoText.label'
        )}
        initialValue={isOneClickSubmitEnabled}
        onCheckChange={handleOneClickSubmitChange}
      />
      {!isOneClickSubmitEnabled && (
        <TextInput
          label={t('editor.blocks.inputs.settings.button.label')}
          defaultValue={
            options?.labels?.button ??
            t('editor.blocks.inputs.settings.buttonText.label')
          }
          onChange={handleButtonLabelChange}
        />
      )}
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
