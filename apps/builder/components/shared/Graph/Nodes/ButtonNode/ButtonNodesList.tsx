import { Flex, Portal, Stack, Text, useEventListener } from '@chakra-ui/react'
import { useStepDnd } from 'contexts/StepDndContext'
import { Coordinates } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import { ChoiceInputStep, ChoiceItem } from 'models'
import React, { useMemo, useState } from 'react'
import { ButtonNode } from './ButtonNode'
import { SourceEndpoint } from '../../Endpoints'
import { ButtonNodeOverlay } from './ButtonNodeOverlay'

type ChoiceItemsListProps = {
  step: ChoiceInputStep
}

export const ButtonNodesList = ({ step }: ChoiceItemsListProps) => {
  const { typebot, createChoiceItem } = useTypebot()
  const {
    draggedChoiceItem,
    mouseOverBlockId,
    setDraggedChoiceItem,
    setMouseOverBlockId,
  } = useStepDnd()
  const showSortPlaceholders = useMemo(
    () => mouseOverBlockId === step.blockId && draggedChoiceItem,
    [draggedChoiceItem, mouseOverBlockId, step.blockId]
  )
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })
  const [expandedPlaceholderIndex, setExpandedPlaceholderIndex] = useState<
    number | undefined
  >()

  const handleStepMove = (event: MouseEvent) => {
    if (!draggedChoiceItem) return
    const { clientX, clientY } = event
    setPosition({
      ...position,
      x: clientX - relativeCoordinates.x,
      y: clientY - relativeCoordinates.y,
    })
  }
  useEventListener('mousemove', handleStepMove)

  const handleMouseUp = (e: MouseEvent) => {
    if (!draggedChoiceItem) return
    if (expandedPlaceholderIndex !== -1) {
      e.stopPropagation()
      createChoiceItem(draggedChoiceItem, expandedPlaceholderIndex)
    }
    setMouseOverBlockId(undefined)
    setExpandedPlaceholderIndex(undefined)
    setDraggedChoiceItem(undefined)
  }
  useEventListener('mouseup', handleMouseUp, undefined, { capture: true })

  const handleStepMouseDown = (
    { absolute, relative }: { absolute: Coordinates; relative: Coordinates },
    item: ChoiceItem
  ) => {
    setPosition(absolute)
    setRelativeCoordinates(relative)
    setMouseOverBlockId(typebot?.steps.byId[item.stepId].blockId)
    setDraggedChoiceItem(item)
  }

  const handleMouseOnTopOfStep = (stepIndex: number) => {
    if (!draggedChoiceItem) return
    setExpandedPlaceholderIndex(stepIndex === 0 ? 0 : stepIndex)
  }

  const handleMouseOnBottomOfStep = (stepIndex: number) => {
    if (!draggedChoiceItem) return
    setExpandedPlaceholderIndex(stepIndex + 1)
  }

  const stopPropagating = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <Stack flex={1} spacing={1} onClick={stopPropagating}>
      <Flex
        h={expandedPlaceholderIndex === 0 ? '50px' : '2px'}
        bgColor={'gray.300'}
        visibility={showSortPlaceholders ? 'visible' : 'hidden'}
        rounded="lg"
        transition={showSortPlaceholders ? 'height 200ms' : 'none'}
      />
      {step.options.itemIds.map((itemId, idx) => (
        <Stack key={itemId} spacing={1}>
          {typebot?.choiceItems.byId[itemId] && (
            <ButtonNode
              item={typebot?.choiceItems.byId[itemId]}
              onMouseMoveTopOfElement={() => handleMouseOnTopOfStep(idx)}
              onMouseMoveBottomOfElement={() => {
                handleMouseOnBottomOfStep(idx)
              }}
              onMouseDown={handleStepMouseDown}
            />
          )}
          <Flex
            h={
              showSortPlaceholders && expandedPlaceholderIndex === idx + 1
                ? '50px'
                : '2px'
            }
            bgColor={'gray.300'}
            visibility={showSortPlaceholders ? 'visible' : 'hidden'}
            rounded="lg"
            transition={showSortPlaceholders ? 'height 200ms' : 'none'}
          />
        </Stack>
      ))}
      <Stack>
        <Flex
          px="4"
          py="2"
          borderWidth="1px"
          borderColor="gray.300"
          bgColor="gray.50"
          rounded="md"
          pos="relative"
          align="center"
          cursor="not-allowed"
        >
          <Text color="gray.500">Default</Text>
          <SourceEndpoint
            source={{
              blockId: step.blockId,
              stepId: step.id,
            }}
            pos="absolute"
            right="15px"
          />
        </Flex>
      </Stack>

      {draggedChoiceItem && draggedChoiceItem.stepId === step.id && (
        <Portal>
          <ButtonNodeOverlay
            item={draggedChoiceItem}
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
