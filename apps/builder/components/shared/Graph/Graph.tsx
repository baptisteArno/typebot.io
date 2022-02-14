import { Flex, FlexProps, useEventListener } from '@chakra-ui/react'
import React, { useRef, useMemo, useEffect, useState } from 'react'
import { blockWidth, useGraph } from 'contexts/GraphContext'
import { BlockNode } from './Nodes/BlockNode/BlockNode'
import { useStepDnd } from 'contexts/GraphDndContext'
import { Edges } from './Edges'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { headerHeight } from 'components/shared/TypebotHeader/TypebotHeader'
import { Block, DraggableStepType, PublicTypebot, Typebot } from 'models'
import { generate } from 'short-uuid'
import { AnswersCount } from 'services/analytics'
import { useDebounce } from 'use-debounce'

export const Graph = ({
  typebot,
  answersCounts,
  onUnlockProPlanClick,
  ...props
}: {
  typebot?: Typebot | PublicTypebot
  answersCounts?: AnswersCount[]
  onUnlockProPlanClick?: () => void
} & FlexProps) => {
  const { draggedStepType, setDraggedStepType, draggedStep, setDraggedStep } =
    useStepDnd()
  const graphContainerRef = useRef<HTMLDivElement | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const { createBlock } = useTypebot()
  const {
    graphPosition,
    setGraphPosition,
    setOpenedStepId,
    updateBlockCoordinates,
    setGraphOffsetY,
  } = useGraph()
  const [debouncedGraphPosition] = useDebounce(graphPosition, 200)
  const transform = useMemo(
    () =>
      `translate(${graphPosition.x}px, ${graphPosition.y}px) scale(${graphPosition.scale})`,
    [graphPosition]
  )
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    editorContainerRef.current = document.getElementById(
      'editor-container'
    ) as HTMLDivElement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!graphContainerRef.current) return
    setGraphOffsetY(
      graphContainerRef.current.getBoundingClientRect().top +
        debouncedGraphPosition.y
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedGraphPosition])

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

  const handleGlobalMouseUp = () => setIsMouseDown(false)
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

  const handleCaptureMouseDown = (e: MouseEvent) => {
    const isRightClick = e.button === 2
    if (isRightClick) e.stopPropagation()
  }

  const handleClick = () => setOpenedStepId(undefined)

  const handleMouseDown = () => setIsMouseDown(true)
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isMouseDown) return
    const { movementX, movementY } = event
    setGraphPosition({
      x: graphPosition.x + movementX,
      y: graphPosition.y + movementY,
      scale: 1,
    })
  }

  useEventListener('wheel', handleMouseWheel, graphContainerRef.current)
  useEventListener('mousedown', handleCaptureMouseDown, undefined, {
    capture: true,
  })
  useEventListener('mouseup', handleMouseUp, graphContainerRef.current)
  useEventListener('mouseup', handleGlobalMouseUp)
  useEventListener('click', handleClick, editorContainerRef.current)
  return (
    <Flex
      ref={graphContainerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      position="relative"
      {...props}
    >
      <Flex
        flex="1"
        w="full"
        h="full"
        position="absolute"
        style={{
          transform,
        }}
        willChange="transform"
        transformOrigin="0px 0px 0px"
      >
        <Edges
          edges={typebot?.edges ?? []}
          answersCounts={answersCounts}
          onUnlockProPlanClick={onUnlockProPlanClick}
        />
        {typebot?.blocks.map((block, idx) => (
          <BlockNode block={block as Block} blockIndex={idx} key={block.id} />
        ))}
      </Flex>
    </Flex>
  )
}
