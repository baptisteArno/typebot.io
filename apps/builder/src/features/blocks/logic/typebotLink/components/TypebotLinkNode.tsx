import { TypebotLinkBlock } from '@typebot.io/schemas'
import React from 'react'
import { Tag, Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { byId } from '@typebot.io/lib'

type Props = {
  block: TypebotLinkBlock
}

export const TypebotLinkNode = ({ block }: Props) => {
  const { linkedTypebots, typebot } = useTypebot()
  const isCurrentTypebot =
    typebot &&
    (block.options.typebotId === typebot.id ||
      block.options.typebotId === 'current')
  const linkedTypebot = isCurrentTypebot
    ? typebot
    : linkedTypebots?.find(byId(block.options.typebotId))
  const blockTitle = linkedTypebot?.groups.find(
    byId(block.options.groupId)
  )?.title
  if (!block.options.typebotId)
    return <Text color="gray.500">Configure...</Text>
  return (
    <Text>
      Jump{' '}
      {blockTitle ? (
        <>
          to <Tag>{blockTitle}</Tag>
        </>
      ) : (
        <></>
      )}{' '}
      {!isCurrentTypebot ? (
        <>
          in <Tag colorScheme="blue">{linkedTypebot?.name}</Tag>
        </>
      ) : (
        <></>
      )}
    </Text>
  )
}
