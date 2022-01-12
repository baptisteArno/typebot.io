import { Flex, Portal, Stack, Text, useEventListener } from '@chakra-ui/react'
import { useDnd } from 'contexts/DndContext'
import { Coordinates } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import { ChoiceInputStep, ChoiceItem } from 'models'
import React, { useMemo, useState } from 'react'
import { SourceEndpoint } from '../SourceEndpoint'
import { ChoiceItemNode } from './ChoiceItemNode'
import { ChoiceItemNodeOverlay } from './ChoiceItemNodeOverlay'

type ChoiceItemsListProps = {
  step: ChoiceInputStep
}

export const ChoiceItemsList = ({ step }: ChoiceItemsListProps) => {
  const { typebot, createChoiceItem } = useTypebot()
  const {
    draggedChoiceItem,
    mouseOverBlockId,
    setDraggedChoiceItem,
    setMouseOverBlockId,
  } = useDnd()
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

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (expandedPlaceholderIndex === undefined || !draggedChoiceItem) return
    e.stopPropagation()
    setMouseOverBlockId(undefined)
    setExpandedPlaceholderIndex(undefined)
    setDraggedChoiceItem(undefined)
    createChoiceItem(draggedChoiceItem, expandedPlaceholderIndex)
  }

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
    <Stack
      flex={1}
      spacing={1}
      onMouseUpCapture={handleMouseUp}
      onClick={stopPropagating}
    >
      <Flex
        h={expandedPlaceholderIndex === 0 ? '50px' : '2px'}
        bgColor={'gray.400'}
        visibility={showSortPlaceholders ? 'visible' : 'hidden'}
        rounded="lg"
        transition={showSortPlaceholders ? 'height 200ms' : 'none'}
      />
      {step.options.itemIds.map((itemId, idx) => (
        <Stack key={itemId} spacing={1}>
          {typebot?.choiceItems.byId[itemId] && (
            <ChoiceItemNode
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
            bgColor={'gray.400'}
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
          bgColor="gray.200"
          borderWidth="2px"
          rounded="md"
          pos="relative"
          align="center"
        >
          <Text>Default</Text>
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
          <ChoiceItemNodeOverlay
            item={draggedChoiceItem}
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
