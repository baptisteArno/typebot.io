import { Tag, Text, VStack } from '@chakra-ui/react'
import { Block } from 'bot-engine'
import { useAnalyticsGraph } from 'contexts/AnalyticsGraphProvider'
import React, { useMemo } from 'react'
import { AnswersCount } from 'services/analytics'
import { computeSourceCoordinates } from 'services/graph'

type Props = {
  answersCounts: AnswersCount[]
  blockId: string
}

export const DropOffBlock = ({ answersCounts, blockId }: Props) => {
  const { typebot } = useAnalyticsGraph()

  const totalAnswers = useMemo(
    () => answersCounts.find((a) => a.blockId === blockId)?.totalAnswers,
    [answersCounts, blockId]
  )

  const { totalDroppedUser, dropOffRate } = useMemo(() => {
    if (!typebot || totalAnswers === undefined)
      return { previousTotal: undefined, dropOffRate: undefined }
    const previousTotal = answersCounts
      .filter(
        (a) =>
          [typebot.startBlock, ...typebot.blocks].find((b) =>
            (b as Block).steps.find((s) => s.target?.blockId === blockId)
          )?.id === a.blockId
      )
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
    const sourceBlock = typebot?.blocks.find((b) => b.id === blockId)
    if (!sourceBlock) return
    return computeSourceCoordinates(
      sourceBlock?.graphCoordinates,
      sourceBlock?.steps.length - 1
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
