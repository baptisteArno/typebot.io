import { Select } from '@/components/inputs/Select'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Stack } from '@chakra-ui/react'
import { JumpBlock } from '@typebot.io/schemas/features/blocks/logic/jump'
import React from 'react'
import { byId, parseGroupTitle } from '@typebot.io/lib'

type Props = {
  groupId: string
  options: JumpBlock['options']
  onOptionsChange: (options: JumpBlock['options']) => void
}

export const JumpSettings = ({ groupId, options, onOptionsChange }: Props) => {
  const { typebot } = useTypebot()

  const handleGroupIdChange = (groupId?: string) =>
    onOptionsChange({ ...options, groupId })

  const handleBlockIdChange = (blockId?: string) =>
    onOptionsChange({ ...options, blockId })

  const currentGroupId = typebot?.groups.find(byId(groupId))?.id

  const selectedGroup = typebot?.groups.find(byId(options.groupId))

  if (!typebot) return null

  return (
    <Stack spacing={4}>
      <Select
        items={typebot.groups
          .filter((group) => group.id !== currentGroupId)
          .map((group) => ({
            label: parseGroupTitle(group.title),
            value: group.id,
          }))}
        selectedItem={selectedGroup?.id}
        onSelect={handleGroupIdChange}
        placeholder="Select a group"
      />
      {selectedGroup && selectedGroup.blocks.length > 1 && (
        <Select
          selectedItem={options.blockId}
          items={selectedGroup.blocks.map((block, index) => ({
            label: `Block #${(index + 1).toString()}`,
            value: block.id,
          }))}
          onSelect={handleBlockIdChange}
          placeholder="Select a block"
        />
      )}
    </Stack>
  )
}
