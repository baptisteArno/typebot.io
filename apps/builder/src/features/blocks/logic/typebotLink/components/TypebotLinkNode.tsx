import { TypebotLinkBlock } from '@typebot.io/schemas'
import React from 'react'
import { Tag, Text } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { byId, isNotEmpty } from '@typebot.io/lib'
import { trpc } from '@/lib/trpc'

type Props = {
  block: TypebotLinkBlock
}

export const TypebotLinkNode = ({ block }: Props) => {
  const { typebot } = useTypebot()

  const { data: linkedTypebotData } = trpc.typebot.getTypebot.useQuery(
    {
      typebotId: block.options?.typebotId as string,
    },
    {
      enabled:
        isNotEmpty(block.options?.typebotId) &&
        block.options?.typebotId !== 'current',
    }
  )

  const isCurrentTypebot =
    typebot &&
    (block.options?.typebotId === typebot.id ||
      block.options?.typebotId === 'current')
  const linkedTypebot = isCurrentTypebot ? typebot : linkedTypebotData?.typebot
  const blockTitle = linkedTypebot?.groups.find(
    byId(block.options?.groupId)
  )?.title

  if (!block.options?.typebotId)
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
          in <Tag colorScheme="orange">{linkedTypebot?.name}</Tag>
        </>
      ) : (
        <></>
      )}
    </Text>
  )
}
