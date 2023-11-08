import React from 'react'
import { Stack } from '@chakra-ui/react'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { ConditionForm } from '@/features/blocks/logic/condition/components/ConditionForm'
import { ButtonItem, Condition } from '@typebot.io/schemas'
import { LogicalOperator } from '@typebot.io/schemas/features/blocks/logic/condition/constants'

type Props = {
  item: ButtonItem
  onSettingsChange: (updates: Omit<ButtonItem, 'content'>) => void
}

export const ButtonsItemSettings = ({ item, onSettingsChange }: Props) => {
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

  return (
    <Stack spacing={4}>
      <SwitchWithRelatedSettings
        label="Display condition"
        moreInfoContent="Only display this item if a condition is met."
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
