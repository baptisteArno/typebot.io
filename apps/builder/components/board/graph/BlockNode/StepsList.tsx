import { useEventListener, Stack, Flex, Portal } from '@chakra-ui/react'
import { DraggableStep, Step, Table } from 'models'
import { useDnd } from 'contexts/DndContext'
import { Coordinates } from 'contexts/GraphContext'
import { useMemo, useState } from 'react'
import { StepNode, StepNodeOverlay } from './StepNode'
import { useTypebot } from 'contexts/TypebotContext'

export const StepsList = ({
  blockId,
  steps,
}: {
  blockId: string
  steps: Table<Step>
}) => {
  const {
    draggedStep,
    setDraggedStep,
    draggedStepType,
    mouseOverBlockId,
    setDraggedStepType,
    setMouseOverBlockId,
  } = useDnd()
  const { createStep } = useTypebot()
  const [expandedPlaceholderIndex, setExpandedPlaceholderIndex] = useState<
    number | undefined
  >()
  const showSortPlaceholders = useMemo(
    () => mouseOverBlockId === blockId && (draggedStep || draggedStepType),
    [mouseOverBlockId, blockId, draggedStep, draggedStepType]
  )
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })

  const handleStepMove = (event: MouseEvent) => {
    if (!draggedStep) return
    const { clientX, clientY } = event
    setPosition({
      ...position,
      x: clientX - relativeCoordinates.x,
      y: clientY - relativeCoordinates.y,
    })
  }
  useEventListener('mousemove', handleStepMove)

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!draggedStep) return
    const element = event.currentTarget as HTMLDivElement
    const rect = element.getBoundingClientRect()
    const y = event.clientY - rect.top
    if (y < 20) setExpandedPlaceholderIndex(0)
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (expandedPlaceholderIndex === undefined) return
    e.stopPropagation()
    setMouseOverBlockId(undefined)
    setExpandedPlaceholderIndex(undefined)
    if (draggedStepType) {
      createStep(blockId, draggedStepType, expandedPlaceholderIndex)
      setDraggedStepType(undefined)
    }
    if (draggedStep) {
      createStep(blockId, draggedStep, expandedPlaceholderIndex)
      setDraggedStep(undefined)
    }
  }

  const handleStepMouseDown = (
    { absolute, relative }: { absolute: Coordinates; relative: Coordinates },
    step: DraggableStep
  ) => {
    setPosition(absolute)
    setRelativeCoordinates(relative)
    setMouseOverBlockId(blockId)
    setDraggedStep(step)
  }

  const handleMouseOnTopOfStep = (stepIndex: number) => {
    if (!draggedStep && !draggedStepType) return
    setExpandedPlaceholderIndex(stepIndex === 0 ? 0 : stepIndex)
  }

  const handleMouseOnBottomOfStep = (stepIndex: number) => {
    if (!draggedStep && !draggedStepType) return
    setExpandedPlaceholderIndex(stepIndex + 1)
  }

  return (
    <Stack
      spacing={1}
      onMouseUpCapture={handleMouseUp}
      onMouseMove={handleMouseMove}
      transition="none"
    >
      <Flex
        h={
          showSortPlaceholders && expandedPlaceholderIndex === 0
            ? '50px'
            : '2px'
        }
        bgColor={'gray.400'}
        visibility={showSortPlaceholders ? 'visible' : 'hidden'}
        rounded="lg"
        transition={showSortPlaceholders ? 'height 200ms' : 'none'}
      />
      {steps.allIds.map((stepId, idx) => (
        <Stack key={stepId} spacing={1}>
          <StepNode
            key={stepId}
            step={steps.byId[stepId]}
            isConnectable={steps.allIds.length - 1 === idx}
            onMouseMoveTopOfElement={() => handleMouseOnTopOfStep(idx)}
            onMouseMoveBottomOfElement={() => {
              handleMouseOnBottomOfStep(idx)
            }}
            onMouseDown={handleStepMouseDown}
          />
          <Flex
            h={
              showSortPlaceholders && expandedPlaceholderIndex === idx + 1
                ? '50px'
                : '2px'
            }
            bgColor={'gray.400'}
            visibility={showSortPlaceholders ? 'visible' : 'hidden'}
            rounded="lg"
            transition={showSortPlaceholders ? 'height 200ms' : 'none'}
          />
        </Stack>
      ))}
      {draggedStep && draggedStep.blockId === blockId && (
        <Portal>
          <StepNodeOverlay
            step={draggedStep}
            pos="fixed"
            top="0"
            left="0"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg)`,
            }}
          />
        </Portal>
      )}
    </Stack>
  )
}
