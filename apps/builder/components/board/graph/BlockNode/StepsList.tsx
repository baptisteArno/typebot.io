import { useEventListener, Stack, Flex, Portal } from '@chakra-ui/react'
import { Step, Table } from 'models'
import { useDnd } from 'contexts/DndContext'
import { Coordinates } from 'contexts/GraphContext'
import { useState } from 'react'
import { StepNode, StepNodeOverlay } from './StepNode'

export const StepsList = ({
  blockId,
  steps,
  showSortPlaceholders,
  onMouseUp,
}: {
  blockId: string
  steps: Table<Step>
  showSortPlaceholders: boolean
  onMouseUp: (index: number) => void
}) => {
  const { draggedStep, setDraggedStep, draggedStepType } = useDnd()
  const [expandedPlaceholderIndex, setExpandedPlaceholderIndex] = useState<
    number | undefined
  >()
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
    setExpandedPlaceholderIndex(undefined)
    onMouseUp(expandedPlaceholderIndex)
  }

  const handleStepMouseDown = (
    { absolute, relative }: { absolute: Coordinates; relative: Coordinates },
    step: Step
  ) => {
    setPosition(absolute)
    setRelativeCoordinates(relative)
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
            onMouseUp={handleMouseUp}
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
