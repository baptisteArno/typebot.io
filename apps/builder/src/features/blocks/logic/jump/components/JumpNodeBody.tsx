import React from 'react'
import { Tag, Text } from '@chakra-ui/react'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { byId, isDefined } from '@sniper.io/lib'
import { JumpBlock } from '@sniper.io/schemas/features/blocks/logic/jump'

type Props = {
  options: JumpBlock['options']
}

export const JumpNodeBody = ({ options }: Props) => {
  const { sniper } = useSniper()
  const selectedGroup = sniper?.groups.find(byId(options?.groupId))
  const blockIndex = selectedGroup?.blocks.findIndex(byId(options?.blockId))
  if (!selectedGroup) return <Text color="gray.500">Configure...</Text>
  return (
    <Text>
      Jump to <Tag colorScheme="blue">{selectedGroup.title}</Tag>{' '}
      {isDefined(blockIndex) && blockIndex >= 0 ? (
        <>
          at block <Tag colorScheme="blue">{blockIndex + 1}</Tag>
        </>
      ) : null}
    </Text>
  )
}
