import { Flex, FlexProps, useEventListener } from '@chakra-ui/react'
import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { DraggableBlockType, PublicTypebot, Typebot } from '@typebot.io/schemas'
import { useDebounce } from 'use-debounce'
import GraphElements from './GraphElements'
import { createId } from '@paralleldrive/cuid2'
import { useUser } from '@/features/account/hooks/useUser'
import { ZoomButtons } from './ZoomButtons'
import { useGesture } from '@use-gesture/react'
import { GraphNavigation } from '@typebot.io/prisma'
import { AnswersCount } from '@/features/analytics/types'
import { headerHeight } from '@/features/editor/constants'
import { graphPositionDefaultValue, blockWidth } from '../constants'
import { useBlockDnd } from '../providers/GraphDndProvider'
import { useGraph } from '../providers/GraphProvider'
import { useGroupsCoordinates } from '../providers/GroupsCoordinateProvider'
import { Coordinates } from '../types'

const maxScale = 2
const minScale = 0.3
const zoomButtonsScaleBlock = 0.2

export const Graph = ({
  typebot,
  answersCounts,
  onUnlockProPlanClick,
  ...props
}: {
  typebot: Typebot | PublicTypebot
  answersCounts?: AnswersCount[]
  onUnlockProPlanClick?: () => void
} & FlexProps) => {
  const {
    draggedBlockType,
    setDraggedBlockType,
    draggedBlock,
    setDraggedBlock,
    draggedItem,
    setDraggedItem,
  } = useBlockDnd()
  const graphContainerRef = useRef<HTMLDivElement | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const { createGroup } = useTypebot()
  const {
    setGraphPosition: setGlobalGraphPosition,
    setOpenedBlockId,
    setOpenedItemId,
    setPreviewingEdge,
    connectingIds,
  } = useGraph()
  const { updateGroupCoordinates } = useGroupsCoordinates()
  const [graphPosition, setGraphPosition] = useState(
    graphPositionDefaultValue(
      typebot.groups.at(0)?.graphCoordinates ?? { x: 0, y: 0 }
    )
  )
  const [debouncedGraphPosition] = useDebounce(graphPosition, 200)
  const transform = useMemo(
    () =>
      `translate(${graphPosition.x}px, ${graphPosition.y}px) scale(${graphPosition.scale})`,
    [graphPosition]
  )
  const { user } = useUser()

  const [autoMoveDirection, setAutoMoveDirection] = useState<
    'top' | 'right' | 'bottom' | 'left' | undefined
  >()
  useAutoMoveBoard(autoMoveDirection, setGraphPosition)

  useEffect(() => {
    editorContainerRef.current = document.getElementById(
      'editor-container'
    ) as HTMLDivElement
  }, [])

  useEffect(() => {
    if (!graphContainerRef.current) return
    const { top, left } = graphContainerRef.current.getBoundingClientRect()
    setGlobalGraphPosition({
      x: left + debouncedGraphPosition.x,
      y: top + debouncedGraphPosition.y,
      scale: debouncedGraphPosition.scale,
    })
  }, [debouncedGraphPosition, setGlobalGraphPosition])

  const handleMouseUp = (e: MouseEvent) => {
    if (!typebot) return
    if (draggedItem) setDraggedItem(undefined)
    if (!draggedBlock && !draggedBlockType) return

    const coordinates = projectMouse(
      { x: e.clientX, y: e.clientY },
      graphPosition
    )
    const id = createId()
    updateGroupCoordinates(id, coordinates)
    createGroup({
      id,
      ...coordinates,
      block: draggedBlock ?? (draggedBlockType as DraggableBlockType),
      indices: { groupIndex: typebot.groups.length, blockIndex: 0 },
    })
    setDraggedBlock(undefined)
    setDraggedBlockType(undefined)
  }

  const handleCaptureMouseDown = (e: MouseEvent) => {
    const isRightClick = e.button === 2
    if (isRightClick) e.stopPropagation()
  }

  const handleClick = () => {
    setOpenedBlockId(undefined)
    setOpenedItemId(undefined)
    setPreviewingEdge(undefined)
  }

  useGesture(
    {
      onDrag: ({ delta: [dx, dy] }) => {
        setGraphPosition({
          ...graphPosition,
          x: graphPosition.x + dx,
          y: graphPosition.y + dy,
        })
      },
      onWheel: ({ delta: [dx, dy], pinching }) => {
        if (pinching) return

        setGraphPosition({
          ...graphPosition,
          x: graphPosition.x - dx,
          y: graphPosition.y - dy,
        })
      },
      onPinch: ({ origin: [x, y], offset: [scale] }) => {
        zoom({ scale, mousePosition: { x, y } })
      },
    },
    {
      target: graphContainerRef,
      pinch: {
        scaleBounds: { min: minScale, max: maxScale },
        modifierKey:
          user?.graphNavigation === GraphNavigation.MOUSE ? null : 'ctrlKey',
      },
      drag: { pointer: { keys: false } },
    }
  )

  const getCenterOfGraph = (): Coordinates => {
    const graphWidth = graphContainerRef.current?.clientWidth ?? 0
    const graphHeight = graphContainerRef.current?.clientHeight ?? 0
    return {
      x: graphWidth / 2,
      y: graphHeight / 2,
    }
  }

  const zoom = ({
    scale,
    mousePosition,
    delta,
  }: {
    scale?: number
    delta?: number
    mousePosition?: Coordinates
  }) => {
    const { x: mouseX, y } = mousePosition ?? getCenterOfGraph()
    const mouseY = y - headerHeight
    let newScale = scale ?? graphPosition.scale + (delta ?? 0)
    if (
      (newScale >= maxScale && graphPosition.scale === maxScale) ||
      (newScale <= minScale && graphPosition.scale === minScale)
    )
      return
    newScale =
      newScale >= maxScale
        ? maxScale
        : newScale <= minScale
        ? minScale
        : newScale

    const xs = (mouseX - graphPosition.x) / graphPosition.scale
    const ys = (mouseY - graphPosition.y) / graphPosition.scale
    setGraphPosition({
      ...graphPosition,
      x: mouseX - xs * newScale,
      y: mouseY - ys * newScale,
      scale: newScale,
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

  useEventListener('mousedown', handleCaptureMouseDown, undefined, {
    capture: true,
  })
  useEventListener('mouseup', handleMouseUp, graphContainerRef.current)
  useEventListener('click', handleClick, editorContainerRef.current)
  useEventListener('mousemove', handleMouseMove)

  // Make sure pinch doesn't interfere with native Safari zoom
  // More info: https://use-gesture.netlify.app/docs/gestures/
  useEventListener('gesturestart', (e) => e.preventDefault())
  useEventListener('gesturechange', (e) => e.preventDefault())

  const zoomIn = () => zoom({ delta: zoomButtonsScaleBlock })
  const zoomOut = () => zoom({ delta: -zoomButtonsScaleBlock })

  return (
    <Flex
      ref={graphContainerRef}
      position="relative"
      style={{ touchAction: 'none' }}
      {...props}
    >
      <ZoomButtons onZoomInClick={zoomIn} onZoomOutClick={zoomOut} />
      <Flex
        flex="1"
        w="full"
        h="full"
        position="absolute"
        data-testid="graph"
        style={{
          transform,
        }}
        willChange="transform"
        transformOrigin="0px 0px 0px"
      >
        <GraphElements
          edges={typebot.edges}
          groups={typebot.groups}
          answersCounts={answersCounts}
          onUnlockProPlanClick={onUnlockProPlanClick}
        />
      </Flex>
    </Flex>
  )
}

const projectMouse = (
  mouseCoordinates: Coordinates,
  graphPosition: Coordinates & { scale: number }
) => {
  return {
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
  }
}

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
  }, [autoMoveDirection, setGraphPosition])
