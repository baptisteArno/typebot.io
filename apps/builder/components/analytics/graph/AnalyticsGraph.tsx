import { Flex, FlexProps, useEventListener } from '@chakra-ui/react'
import { useAnalyticsGraph } from 'contexts/AnalyticsGraphProvider'
import React, { useMemo, useRef } from 'react'
import { AnswersCount } from 'services/analytics'
import { BlockNode } from './blocks/BlockNode'
import { Edges } from './Edges'

const AnalyticsGraph = ({
  answersCounts,
  ...props
}: { answersCounts?: AnswersCount[] } & FlexProps) => {
  const { typebot, graphPosition, setGraphPosition } = useAnalyticsGraph()
  const graphContainerRef = useRef<HTMLDivElement | null>(null)
  const transform = useMemo(
    () =>
      `translate(${graphPosition.x}px, ${graphPosition.y}px) scale(${graphPosition.scale})`,
    [graphPosition]
  )

  const handleMouseWheel = (e: WheelEvent) => {
    e.preventDefault()
    const isPinchingTrackpad = e.ctrlKey
    if (isPinchingTrackpad) {
      const scale = graphPosition.scale - e.deltaY * 0.01
      if (scale <= 0.2 || scale >= 1) return
      setGraphPosition({
        ...graphPosition,
        scale,
      })
    } else
      setGraphPosition({
        ...graphPosition,
        x: graphPosition.x - e.deltaX,
        y: graphPosition.y - e.deltaY,
      })
  }
  useEventListener('wheel', handleMouseWheel, graphContainerRef.current)

  if (!typebot) return <></>
  return (
    <Flex ref={graphContainerRef} {...props}>
      <Flex
        flex="1"
        boxSize={'200px'}
        maxW={'200px'}
        style={{
          transform,
        }}
      >
        <Edges answersCounts={answersCounts} />
        {typebot.blocks.allIds.map((blockId) => (
          <BlockNode block={typebot.blocks.byId[blockId]} key={blockId} />
        ))}
      </Flex>
    </Flex>
  )
}

export default AnalyticsGraph
