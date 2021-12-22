import { Flex, useEventListener } from '@chakra-ui/react'
import React, { useRef, useMemo } from 'react'
import { blockWidth, useGraph } from 'contexts/GraphContext'
import { BlockNode } from './BlockNode/BlockNode'
import { useDnd } from 'contexts/DndContext'
import { Edges } from './Edges'
import { useTypebot } from 'contexts/TypebotContext'
import { StartBlockNode } from './BlockNode/StartBlockNode'
import { headerHeight } from 'components/shared/TypebotHeader/TypebotHeader'

const Graph = () => {
  const { draggedStepType, setDraggedStepType, draggedStep, setDraggedStep } =
    useDnd()
  const graphContainerRef = useRef<HTMLDivElement | null>(null)
  const { typebot, addNewBlock } = useTypebot()
  const { graphPosition, setGraphPosition } = useGraph()
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

  const handleMouseUp = (e: MouseEvent) => {
    if (!draggedStep && !draggedStepType) return
    addNewBlock({
      step: draggedStep,
      type: draggedStepType,
      x: e.clientX - graphPosition.x - blockWidth / 3,
      y: e.clientY - graphPosition.y - 20 - headerHeight,
    })
    setDraggedStep(undefined)
    setDraggedStepType(undefined)
  }
  useEventListener('mouseup', handleMouseUp, graphContainerRef.current)

  const handleMouseDown = (e: MouseEvent) => {
    const isRightClick = e.button === 2
    if (isRightClick) e.stopPropagation()
  }
  useEventListener('mousedown', handleMouseDown, undefined, { capture: true })

  if (!typebot) return <></>
  return (
    <Flex ref={graphContainerRef} flex="1">
      <Flex
        flex="1"
        boxSize={'200px'}
        maxW={'200px'}
        style={{
          transform,
        }}
      >
        <Edges />
        {typebot.startBlock && <StartBlockNode block={typebot.startBlock} />}
        {(typebot.blocks ?? []).map((block) => (
          <BlockNode block={block} key={block.id} />
        ))}
      </Flex>
    </Flex>
  )
}

export default Graph
