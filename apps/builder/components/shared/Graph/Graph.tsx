import {
  Flex,
  FlexProps,
  useEventListener,
  Stack,
  Tooltip,
  IconButton,
} from '@chakra-ui/react'
import { RedoIcon, UndoIcon } from 'assets/icons'
import React, { useRef, useMemo, useEffect, useState } from 'react'
import {
  blockWidth,
  Coordinates,
  graphPositionDefaultValue,
  useGraph,
} from 'contexts/GraphContext'
import { useStepDnd } from 'contexts/GraphDndContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { DraggableStepType, PublicTypebot, Typebot } from 'models'
import { AnswersCount } from 'services/analytics'
import { useDebounce } from 'use-debounce'
import { DraggableCore, DraggableData, DraggableEvent } from 'react-draggable'
import GraphContent from './GraphContent'
import cuid from 'cuid'
import { headerHeight } from '../TypebotHeader'
import { ZoomButtons } from './ZoomButtons'

const maxScale = 1.5
const minScale = 0.1
const zoomButtonsScaleStep = 0.2

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
  const {
    draggedStepType,
    setDraggedStepType,
    draggedStep,
    setDraggedStep,
    draggedItem,
    setDraggedItem,
  } = useStepDnd()

  const graphContainerRef = useRef<HTMLDivElement | null>(null)

  const editorContainerRef = useRef<HTMLDivElement | null>(null)

  const { createBlock, undo, redo, canUndo, canRedo } = useTypebot()

  const {
    setGraphPosition: setGlobalGraphPosition,
    graphPosition: globalGraphPosition,
    setOpenedStepId,
    updateBlockCoordinates,
    setPreviewingEdge,
    connectingIds,
  } = useGraph()

  const [graphPosition, setGraphPosition] = useState(graphPositionDefaultValue)

  const [debouncedGraphPosition] = useDebounce(graphPosition, 200)

  const transform = useMemo(() => {
    return `translate(${graphPosition.x}px, ${graphPosition.y}px) scale(${graphPosition.scale})`
  }, [graphPosition])

  const [autoMoveDirection, setAutoMoveDirection] = useState<
    'top' | 'right' | 'bottom' | 'left' | undefined
  >()
  useAutoMoveBoard(autoMoveDirection, setGraphPosition)

  useEffect(() => {
    if (JSON.stringify(globalGraphPosition) === JSON.stringify(graphPosition))
      return
    setGraphPosition({ ...globalGraphPosition })
  }, [globalGraphPosition])

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
      scale: debouncedGraphPosition.scale,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedGraphPosition])

  const handleMouseWheel = (e: WheelEvent) => {
    e.preventDefault()

    const isPinchingTrackpad = e.ctrlKey

    isPinchingTrackpad
      ? zoom((e.deltaY > 0 ? -1 : 1) * zoomButtonsScaleStep, {
          x: e.clientX,
          y: e.clientY,
        })
      : setGraphPosition({
          ...graphPosition,
          x: graphPosition.x - e.deltaX,
          y: graphPosition.y - e.deltaY,
        })
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (!typebot) return

    if (draggedItem) setDraggedItem(undefined)

    if (!draggedStep && !draggedStepType) return

    const coordinates = projectMouse(
      { x: e.clientX, y: e.clientY },
      graphPosition
    )

    const id = cuid()

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

  const handleClick = () => {
    setOpenedStepId(undefined)

    setPreviewingEdge(undefined)
  }

  const onDrag = (_: DraggableEvent, draggableData: DraggableData) => {
    const { deltaX, deltaY } = draggableData

    setGraphPosition({
      ...graphPosition,
      x: graphPosition.x + deltaX,
      y: graphPosition.y + deltaY,
    })
  }

  const zoom = (delta = zoomButtonsScaleStep, mousePosition?: Coordinates) => {
    const { x: mouseX, y } = mousePosition ?? { x: 0, y: 0 }

    const mouseY = y - headerHeight

    let scale = graphPosition.scale + delta

    if (
      (scale >= maxScale && graphPosition.scale === maxScale) ||
      (scale <= minScale && graphPosition.scale === minScale)
    )
      return

    scale = scale >= maxScale ? maxScale : scale <= minScale ? minScale : scale

    const xs = (mouseX - graphPosition.x) / graphPosition.scale

    const ys = (mouseY - graphPosition.y) / graphPosition.scale

    setGraphPosition({
      ...graphPosition,
      x: mouseX - xs * scale,
      y: mouseY - ys * scale,
      scale,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!connectingIds)
      return autoMoveDirection ? setAutoMoveDirection(undefined) : undefined

    if (e.clientX <= 50) return setAutoMoveDirection('left')

    if (e.clientY <= 50 + headerHeight) return setAutoMoveDirection('top')

    if (e.clientX >= window.innerWidth - 50)
      return setAutoMoveDirection('right')

    if (e.clientY >= window.innerHeight - 50)
      return setAutoMoveDirection('bottom')

    setAutoMoveDirection(undefined)
  }

  useEventListener('wheel', handleMouseWheel, graphContainerRef.current)

  useEventListener('mousedown', handleCaptureMouseDown, undefined, {
    capture: true,
  })

  useEventListener('mouseup', handleMouseUp, graphContainerRef.current)

  useEventListener('click', handleClick, editorContainerRef.current)

  useEventListener('mousemove', handleMouseMove)

  const draggingStep = draggedStep || draggedStepType

  return (
    <DraggableCore onDrag={onDrag} enableUserSelectHack={false}>
      <Flex
        ref={graphContainerRef}
        position="relative"
        {...props}
        background={draggingStep ? 'gray.200' : '#ffffff'}
        backgroundImage="radial-gradient(#c6d0e1 1px, transparent 0)"
        backgroundSize="40px 40px"
        backgroundPosition="-19px -19px"
      >
        <ZoomButtons
          onZoomIn={() => zoom(zoomButtonsScaleStep)}
          onZoomOut={() => zoom(-zoomButtonsScaleStep)}
        />

        <Stack
          pos="fixed"
          top={`calc(${headerHeight}px + 150px)`}
          right="40px"
          bgColor="white"
          rounded="md"
          zIndex={1}
          spacing="0"
          shadow="lg"
        >
          <Tooltip label="Undo">
            <IconButton
              display={['none', 'flex']}
              icon={<UndoIcon />}
              size="sm"
              aria-label="Undo"
              onClick={undo}
              isDisabled={!canUndo}
            />
          </Tooltip>

          <Tooltip label="Redo">
            <IconButton
              display={['none', 'flex']}
              icon={<RedoIcon />}
              size="sm"
              aria-label="Redo"
              onClick={redo}
              isDisabled={!canRedo}
            />
          </Tooltip>
        </Stack>

        <Flex
          flex="1"
          w="full"
          h="full"
          position="absolute"
          style={{
            transform,
            transition: '0.1s',
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

const projectMouse = (
  mouseCoordinates: Coordinates,
  graphPosition: Coordinates & { scale: number }
) => ({
  x:
    (mouseCoordinates.x -
      graphPosition.x -
      blockWidth / (3 / graphPosition.scale)) /
    graphPosition.scale,
  y:
    (mouseCoordinates.y -
      graphPosition.y -
      (headerHeight + 20 * graphPosition.scale)) /
    graphPosition.scale,
})

const useAutoMoveBoard = (
  autoMoveDirection: 'top' | 'right' | 'bottom' | 'left' | undefined,
  setGraphPosition: React.Dispatch<
    React.SetStateAction<{
      x: number
      y: number
      scale: number
    }>
  >
) =>
  useEffect(() => {
    if (!autoMoveDirection) return
    const interval = setInterval(() => {
      setGraphPosition((prev) => ({
        ...prev,
        x:
          autoMoveDirection === 'right'
            ? prev.x - 5
            : autoMoveDirection === 'left'
            ? prev.x + 5
            : prev.x,
        y:
          autoMoveDirection === 'bottom'
            ? prev.y - 5
            : autoMoveDirection === 'top'
            ? prev.y + 5
            : prev.y,
      }))
    }, 5)

    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMoveDirection])
