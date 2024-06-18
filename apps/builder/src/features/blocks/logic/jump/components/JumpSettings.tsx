import { Select } from '@/components/inputs/Select'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { Stack } from '@chakra-ui/react'
import { JumpBlock } from '@sniper.io/schemas/features/blocks/logic/jump'
import React from 'react'
import { byId, isNotEmpty } from '@sniper.io/lib'
import { BlockIcon } from '@/features/editor/components/BlockIcon'

type Props = {
  groupId: string
  options: JumpBlock['options']
  onOptionsChange: (options: JumpBlock['options']) => void
}

export const JumpSettings = ({ groupId, options, onOptionsChange }: Props) => {
  const { sniper } = useSniper()

  const handleGroupIdChange = (groupId?: string) =>
    onOptionsChange({ ...options, groupId })

  const handleBlockIdChange = (blockId?: string) =>
    onOptionsChange({ ...options, blockId })

  const currentGroupId = sniper?.groups.find(byId(groupId))?.id

  const selectedGroup = sniper?.groups.find(byId(options?.groupId))

  if (!sniper) return null

  return (
    <Stack spacing={4}>
      <Select
        items={sniper.groups
          .filter(
            (group) => group.id !== currentGroupId && isNotEmpty(group.title)
          )
          .map((group) => ({
            label: group.title,
            value: group.id,
          }))}
        selectedItem={selectedGroup?.id}
        onSelect={handleGroupIdChange}
        placeholder="Select a group"
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
          placeholder="Select a block"
        />
      )}
    </Stack>
  )
}
