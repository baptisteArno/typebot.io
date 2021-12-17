import { Flex, useEventListener } from '@chakra-ui/react'
import React, { useRef, useMemo, useEffect } from 'react'
import { blockWidth, useGraph } from 'contexts/GraphContext'
import { BlockNode } from './BlockNode/BlockNode'
import { useDnd } from 'contexts/DndContext'
import { Edges } from './Edges'
import { useTypebot } from 'contexts/TypebotContext'
import { StartBlockNode } from './BlockNode/StartBlockNode'

const Graph = () => {
  const { draggedStepType, setDraggedStepType, draggedStep, setDraggedStep } =
    useDnd()
  const graphContainerRef = useRef<HTMLDivElement | null>(null)
  const { typebot } = useTypebot()
  const {
    blocks,
    setBlocks,
    graphPosition,
    setGraphPosition,
    addNewBlock,
    setStartBlock,
    startBlock,
  } = useGraph()
  const transform = useMemo(
    () =>
      `translate(${graphPosition.x}px, ${graphPosition.y}px) scale(${graphPosition.scale})`,
    [graphPosition]
  )

  useEffect(() => {
    if (!typebot) return
    setBlocks(typebot.blocks)
    setStartBlock(typebot.startBlock)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typebot?.blocks])

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

  const handleMouseUp = (e: MouseEvent) => {
    if (!draggedStep && !draggedStepType) return
    addNewBlock({
      step: draggedStep,
      type: draggedStepType,
      x: e.clientX - graphPosition.x - blockWidth / 3,
      y: e.clientY - graphPosition.y - 20,
    })
    setDraggedStep(undefined)
    setDraggedStepType(undefined)
  }
  useEventListener('mouseup', handleMouseUp, graphContainerRef.current)

  if (!typebot) return <></>
  return (
    <Flex ref={graphContainerRef} flex="1" h="full">
      <Flex
        flex="1"
        boxSize={'200px'}
        style={{
          transform,
        }}
      >
        <Edges />
        {startBlock && <StartBlockNode block={startBlock} />}
        {blocks.map((block) => (
          <BlockNode block={block} key={block.id} />
        ))}
      </Flex>
    </Flex>
  )
}

export default Graph
