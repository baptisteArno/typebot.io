import React from 'react'
import { TextInput, Textarea } from '@/components/inputs'
import { PictureChoiceItem } from '@typebot.io/schemas/features/blocks/inputs/pictureChoice'
import {
  Button,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ImageUploadContent } from '@/components/ImageUploadContent'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { ConditionForm } from '@/features/blocks/logic/condition/components/ConditionForm'
import { Condition } from '@typebot.io/schemas'
import { LogicalOperator } from '@typebot.io/schemas/features/blocks/logic/condition/constants'
import { useTranslate } from '@tolgee/react'

type Props = {
  workspaceId: string
  typebotId: string
  blockId: string
  item: PictureChoiceItem
  onItemChange: (updates: Partial<PictureChoiceItem>) => void
}

export const PictureChoiceItemSettings = ({
  workspaceId,
  typebotId,
  blockId,
  item,
  onItemChange,
}: Props) => {
  const { t } = useTranslate()

  const updateTitle = (title: string) => onItemChange({ ...item, title })

  const updateImage = (pictureSrc: string) => {
    onItemChange({ ...item, pictureSrc })
  }

  const updateDescription = (description: string) =>
    onItemChange({ ...item, description })

  const updateIsDisplayConditionEnabled = (isEnabled: boolean) =>
    onItemChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        isEnabled,
      },
    })

  const updateDisplayCondition = (condition: Condition) =>
    onItemChange({
      ...item,
      displayCondition: {
        ...item.displayCondition,
        condition,
      },
    })

  return (
    <Stack spacing={4}>
      <HStack>
        <Text fontWeight="medium">
          {t('blocks.inputs.picture.itemSettings.image.label')}
        </Text>
        <Popover isLazy>
          {({ onClose }) => (
            <>
              <PopoverTrigger>
                <Button size="sm">
                  {item.pictureSrc
                    ? t('blocks.inputs.picture.itemSettings.image.change.label')
                    : t('blocks.inputs.picture.itemSettings.image.pick.label')}
                </Button>
              </PopoverTrigger>
              <PopoverContent p="4" w="500px">
                <ImageUploadContent
                  uploadFileProps={{
                    workspaceId,
                    typebotId,
                    blockId,
                    itemId: item.id,
                  }}
                  defaultUrl={item.pictureSrc}
                  onSubmit={(url) => {
                    updateImage(url)
                    onClose()
                  }}
                  excludedTabs={['emoji']}
                />
              </PopoverContent>
            </>
          )}
        </Popover>
      </HStack>
      <TextInput
        label={t('blocks.inputs.picture.itemSettings.title.label')}
        defaultValue={item.title}
        onChange={updateTitle}
      />
      <Textarea
        label={t('blocks.inputs.settings.description.label')}
        defaultValue={item.description}
        onChange={updateDescription}
      />
      <SwitchWithRelatedSettings
        label={t('blocks.inputs.settings.displayCondition.label')}
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
