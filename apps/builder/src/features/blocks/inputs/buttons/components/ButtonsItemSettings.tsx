import React from 'react'
import { Stack } from '@chakra-ui/react'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { ConditionForm } from '@/features/blocks/logic/condition/components/ConditionForm'
import { ButtonItem, Condition } from '@typebot.io/schemas'
import { LogicalOperator } from '@typebot.io/schemas/features/blocks/logic/condition/constants'
import { useTranslate } from '@tolgee/react'
import { TextInput } from '../../../../../components/inputs'

type Props = {
  item: ButtonItem
  onSettingsChange: (updates: Omit<ButtonItem, 'content'>) => void
}

export const ButtonsItemSettings = ({ item, onSettingsChange }: Props) => {
  const { t } = useTranslate()

  const updateIsDisplayConditionEnabled = (isEnabled: boolean) =>
    onSettingsChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        isEnabled,
      },
    })

  const updateDisplayCondition = (condition: Condition) =>
    onSettingsChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        condition,
      },
    })

  const updateDescription = (description: string) =>
    onSettingsChange({
      ...item,
      interactiveData: {
        ...item.interactiveData,
        description,
      },
    })

  const updateSection = (section: string) =>
    onSettingsChange({
      ...item,
      interactiveData: {
        ...item.interactiveData,
        section,
      },
    })

  const updatePayload = (payload: string) =>
    onSettingsChange({
      ...item,
      interactiveData: {
        ...item.interactiveData,
        payload,
      },
    })

  return (
    <Stack spacing={4}>
      <TextInput
        label={t(
          'blocks.inputs.button.buttonSettings.interactiveData.description.label'
        )}
        placeholder={t(
          'blocks.inputs.button.buttonSettings.interactiveData.description.placeholder'
        )}
        helperText={t(
          'blocks.inputs.button.buttonSettings.interactiveData.description.helperText'
        )}
        defaultValue={item?.interactiveData?.description}
        onChange={updateDescription}
      />
      <TextInput
        label={t(
          'blocks.inputs.button.buttonSettings.interactiveData.section.label'
        )}
        placeholder={t(
          'blocks.inputs.button.buttonSettings.interactiveData.section.placeholder'
        )}
        helperText={t(
          'blocks.inputs.button.buttonSettings.interactiveData.section.helperText'
        )}
        defaultValue={item?.interactiveData?.section}
        onChange={updateSection}
      />
      <TextInput
        label={t(
          'blocks.inputs.button.buttonSettings.interactiveData.payload.label'
        )}
        placeholder={t(
          'blocks.inputs.button.buttonSettings.interactiveData.payload.placeholder'
        )}
        helperText={t(
          'blocks.inputs.button.buttonSettings.interactiveData.payload.helperText'
        )}
        defaultValue={item?.interactiveData?.payload}
        onChange={updatePayload}
      />
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.settings.displayCondition.label')}
        moreInfoContent={t(
          'blocks.inputs.button.buttonSettings.displayCondition.infoText.label'
        )}
        initialValue={item.displayCondition?.isEnabled ?? false}
        onCheckChange={updateIsDisplayConditionEnabled}
      >
        <ConditionForm
          condition={
            item.displayCondition?.condition ?? {
              comparisons: [],
              logicalOperator: LogicalOperator.AND,
            }
          }
          onConditionChange={updateDisplayCondition}
        />
      </SwitchWithRelatedSettings>
    </Stack>
  )
}
