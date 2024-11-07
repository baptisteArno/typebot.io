import { Select } from '@/components/inputs/Select'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Stack } from '@chakra-ui/react'
import React from 'react'
import { byId, isNotEmpty } from '@typebot.io/lib'
import { BlockIcon } from '@/features/editor/components/BlockIcon'
import { GlobalJumpBlock } from '@typebot.io/schemas'
import { TextInput } from '../../../../../components/inputs'
import { useTranslate } from '@tolgee/react'

type Props = {
  groupId: string
  options: GlobalJumpBlock['options']
  onOptionsChange: (options: GlobalJumpBlock['options']) => void
}

export const GlobalJumpSettings = ({
  groupId,
  options,
  onOptionsChange,
}: Props) => {
  const { t } = useTranslate()
  const { typebot } = useTypebot()

  const handleTextChange = (text?: string) =>
    onOptionsChange({ ...options, text })

  const handleGroupIdChange = (groupId?: string) =>
    onOptionsChange({ ...options, groupId })

  const handleBlockIdChange = (blockId?: string) =>
    onOptionsChange({ ...options, blockId })

  const currentGroupId = typebot?.groups.find(byId(groupId))?.id

  const selectedGroup = typebot?.groups.find(byId(options?.groupId))

  if (!typebot) return null

  return (
    <Stack spacing={4}>
      <TextInput
        defaultValue={options?.text}
        placeholder={t('blocks.logic.globalJump.inputText.placeholder')}
        type="text"
        onChange={handleTextChange}
      />
      <Select
        items={typebot.groups
          .filter(
            (group) => group.id !== currentGroupId && isNotEmpty(group.title)
          )
          .map((group) => ({
            label: group.title,
            value: group.id,
          }))}
        selectedItem={selectedGroup?.id}
        onSelect={handleGroupIdChange}
        placeholder={t('blocks.logic.globalJump.inputGroup.placeholder')}
      />
      {selectedGroup && selectedGroup.blocks.length > 1 && (
        <Select
          selectedItem={options?.blockId}
          items={selectedGroup.blocks.map((block, index) => ({
            label: `Block #${(index + 1).toString()}`,
            value: block.id,
            icon: <BlockIcon type={block.type} />,
          }))}
          onSelect={handleBlockIdChange}
          placeholder={t('blocks.logic.globalJump.inputBlock.placeholder')}
        />
      )}
    </Stack>
  )
}
