import React from 'react'
import { Tag, Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { byId, isDefined } from '@typebot.io/lib'
import { GlobalJumpBlock } from '@typebot.io/schemas'

type Props = {
  options: GlobalJumpBlock['options']
}

export const GlobalJumpNodeBody = ({ options }: Props) => {
  const { typebot } = useTypebot()
  const selectedGroup = typebot?.groups.find(byId(options?.groupId))
  const blockIndex = selectedGroup?.blocks.findIndex(byId(options?.blockId))
  if (!options?.text || !selectedGroup)
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text>
      When <Tag colorScheme="orange">{options.text}</Tag>, jump to{' '}
      <Tag colorScheme="orange">{selectedGroup.title}</Tag>{' '}
      {isDefined(blockIndex) && blockIndex >= 0 ? (
        <>
          at block <Tag colorScheme="orange">{blockIndex + 1}</Tag>
        </>
      ) : null}
    </Text>
  )
}
