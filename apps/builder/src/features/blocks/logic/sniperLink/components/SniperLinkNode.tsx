import { SniperLinkBlock } from '@sniper.io/schemas'
import React from 'react'
import { Tag, Text } from '@chakra-ui/react'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { byId, isNotEmpty } from '@sniper.io/lib'
import { trpc } from '@/lib/trpc'

type Props = {
  block: SniperLinkBlock
}

export const SniperLinkNode = ({ block }: Props) => {
  const { sniper } = useSniper()

  const { data: linkedSniperData } = trpc.sniper.getSniper.useQuery(
    {
      sniperId: block.options?.sniperId as string,
    },
    {
      enabled:
        isNotEmpty(block.options?.sniperId) &&
        block.options?.sniperId !== 'current',
    }
  )

  const isCurrentSniper =
    sniper &&
    (block.options?.sniperId === sniper.id ||
      block.options?.sniperId === 'current')
  const linkedSniper = isCurrentSniper ? sniper : linkedSniperData?.sniper
  const blockTitle = linkedSniper?.groups.find(
    byId(block.options?.groupId)
  )?.title

  if (!block.options?.sniperId)
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
      {!isCurrentSniper ? (
        <>
          in <Tag colorScheme="blue">{linkedSniper?.name}</Tag>
        </>
      ) : (
        <></>
      )}
    </Text>
  )
}
