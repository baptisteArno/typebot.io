import { Flex, FlexProps, useEventListener } from '@chakra-ui/react'
import React, { useRef, useMemo, useEffect, useState } from 'react'
import {
  blockWidth,
  graphPositionDefaultValue,
  useGraph,
} from 'contexts/GraphContext'
import { useStepDnd } from 'contexts/GraphDndContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { headerHeight } from 'components/shared/TypebotHeader/TypebotHeader'
import { DraggableStepType, PublicTypebot, Typebot } from 'models'
import { generate } from 'short-uuid'
import { AnswersCount } from 'services/analytics'
import { useDebounce } from 'use-debounce'
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable'
import GraphContent from './GraphContent'

declare const window: { chrome: unknown | undefined }

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
    setGraphPosition: setGlobalGraphPosition,
    setOpenedStepId,
    updateBlockCoordinates,
  } = useGraph()
  const [graphPosition, setGraphPosition] = useState(graphPositionDefaultValue)
  const [debouncedGraphPosition] = useDebounce(graphPosition, 200)
  const transform = useMemo(
    () =>
      `translate(${graphPosition.x}px, ${graphPosition.y}px) scale(${graphPosition.scale})`,
    [graphPosition]
  )

  useEffect(() => {
    editorContainerRef.current = document.getElementById(
      'editor-container'
    ) as HTMLDivElement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!graphContainerRef.current) return
    const { top, left } = graphContainerRef.current.getBoundingClientRect()
    setGlobalGraphPosition({
      x: left + debouncedGraphPosition.x,
      y: top + debouncedGraphPosition.y,
      scale: 1,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedGraphPosition])

  const handleMouseWheel = (e: WheelEvent) => {
    e.preventDefault()
    const isPinchingTrackpad = e.ctrlKey
    if (isPinchingTrackpad) return
    setGraphPosition({
      ...graphPosition,
      x: graphPosition.x - e.deltaX / (window.chrome ? 2 : 1),
      y: graphPosition.y - e.deltaY / (window.chrome ? 2 : 1),
    })
  }

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

  useEventListener('wheel', handleMouseWheel, graphContainerRef.current)
  useEventListener('mousedown', handleCaptureMouseDown, undefined, {
    capture: true,
  })
  useEventListener('mouseup', handleMouseUp, graphContainerRef.current)
  useEventListener('click', handleClick, editorContainerRef.current)

  const onDrag = (_: DraggableEvent, draggableData: DraggableData) => {
    const { deltaX, deltaY } = draggableData
    setGraphPosition({
      x: graphPosition.x + deltaX,
      y: graphPosition.y + deltaY,
      scale: 1,
    })
  }

  return (
    <DraggableCore onDrag={onDrag} enableUserSelectHack={false}>
      <Flex ref={graphContainerRef} position="relative" {...props}>
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
          <GraphContent
            answersCounts={answersCounts}
            onUnlockProPlanClick={onUnlockProPlanClick}
          />
        </Flex>
      </Flex>
    </DraggableCore>
  )
}
