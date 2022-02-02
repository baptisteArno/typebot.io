import { Tag, Text, VStack } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
import React, { useMemo } from 'react'
import { AnswersCount } from 'services/analytics'
import { computeSourceCoordinates } from 'services/graph'
import { isDefined } from 'utils'

type Props = {
  answersCounts: AnswersCount[]
  blockId: string
}

export const DropOffNode = ({ answersCounts, blockId }: Props) => {
  const { typebot } = useTypebot()

  const totalAnswers = useMemo(
    () => answersCounts.find((a) => a.blockId === blockId)?.totalAnswers,
    [answersCounts, blockId]
  )

  const { totalDroppedUser, dropOffRate } = useMemo(() => {
    if (!typebot || totalAnswers === undefined)
      return { previousTotal: undefined, dropOffRate: undefined }
    const previousBlockIds = typebot.edges.allIds
      .map((edgeId) => {
        const edge = typebot.edges.byId[edgeId]
        return edge.to.blockId === blockId ? edge.from.blockId : undefined
      })
      .filter((blockId) => isDefined(blockId))
    const previousTotal = answersCounts
      .filter((a) => previousBlockIds.includes(a.blockId))
      .reduce((prev, acc) => acc.totalAnswers + prev, 0)
    if (previousTotal === 0)
      return { previousTotal: undefined, dropOffRate: undefined }
    const totalDroppedUser = previousTotal - totalAnswers

    return {
      totalDroppedUser,
      dropOffRate: Math.round((totalDroppedUser / previousTotal) * 100),
    }
  }, [answersCounts, blockId, totalAnswers, typebot])

  const labelCoordinates = useMemo(() => {
    if (!typebot) return { x: 0, y: 0 }
    const sourceBlock = typebot?.blocks.byId[blockId]
    if (!sourceBlock) return
    return computeSourceCoordinates(
      sourceBlock?.graphCoordinates,
      sourceBlock?.stepIds.length - 1
    )
  }, [blockId, typebot])

  if (!labelCoordinates) return <></>
  return (
    <VStack
      bgColor={'red.500'}
      color="white"
      rounded="md"
      p="2"
      justifyContent="center"
      style={{
        transform: `translate(${labelCoordinates.x - 20}px, ${
          labelCoordinates.y + 80
        }px)`,
      }}
      pos="absolute"
    >
      <Text>{dropOffRate}%</Text>
      <Tag colorScheme="red">{totalDroppedUser} users</Tag>
    </VStack>
  )
}
