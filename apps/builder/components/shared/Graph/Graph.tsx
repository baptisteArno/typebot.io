import { Flex, FlexProps, useEventListener } from '@chakra-ui/react'
import React, { useRef, useMemo, useEffect } from 'react'
import { blockWidth, useGraph } from 'contexts/GraphContext'
import { BlockNode } from './Nodes/BlockNode/BlockNode'
import { useStepDnd } from 'contexts/GraphDndContext'
import { Edges } from './Edges'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { headerHeight } from 'components/shared/TypebotHeader/TypebotHeader'
import { DraggableStepType } from 'models'
import { generate } from 'short-uuid'
import { AnswersCount } from 'services/analytics'
import { DropOffNode } from './Nodes/DropOffNode'

export const Graph = ({
  answersCounts,
  ...props
}: { answersCounts?: AnswersCount[] } & FlexProps) => {
  const { draggedStepType, setDraggedStepType, draggedStep, setDraggedStep } =
    useStepDnd()
  const graphContainerRef = useRef<HTMLDivElement | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const { createBlock, typebot } = useTypebot()
  const {
    graphPosition,
    setGraphPosition,
    setOpenedStepId,
    updateBlockCoordinates,
  } = useGraph()
  const transform = useMemo(
    () =>
      `translate(${graphPosition.x}px, ${graphPosition.y}px) scale(${graphPosition.scale})`,
    [graphPosition]
  )

  useEffect(() => {
    editorContainerRef.current = document.getElementById(
      'editor-container'
    ) as HTMLDivElement
  }, [])

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
    if (!typebot) return
    if (!draggedStep && !draggedStepType) return
    const coordinates = {
      x: e.clientX - graphPosition.x - blockWidth / 3,
      y: e.clientY - graphPosition.y - 20 - headerHeight,
    }
    const id = generate()
    updateBlockCoordinates(id, coordinates)
    createBlock({
      id,
      ...coordinates,
      step: draggedStep ?? (draggedStepType as DraggableStepType),
      indices: { blockIndex: typebot.blocks.length, stepIndex: 0 },
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

  const handleClick = () => setOpenedStepId(undefined)
  useEventListener('click', handleClick, editorContainerRef.current)

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
        <Edges edges={typebot?.edges ?? []} />
        {typebot?.blocks.map((block, idx) => (
          <BlockNode block={block} blockIndex={idx} key={block.id} />
        ))}
        {answersCounts?.map((answersCount) => (
          <DropOffNode
            key={answersCount.blockId}
            answersCounts={answersCounts}
            blockId={answersCount.blockId}
          />
        ))}
      </Flex>
    </Flex>
  )
}
