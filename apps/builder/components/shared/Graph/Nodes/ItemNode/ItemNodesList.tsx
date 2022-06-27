import { Flex, Portal, Stack, Text, useEventListener } from '@chakra-ui/react'
import {
  computeNearestPlaceholderIndex,
  useStepDnd,
} from 'contexts/GraphDndContext'
import { Coordinates, useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import { ButtonItem, StepIndices, StepWithItems } from 'models'
import React, { useEffect, useRef, useState } from 'react'
import { ItemNode } from './ItemNode'
import { SourceEndpoint } from '../../Endpoints'
import { ItemNodeOverlay } from './ItemNodeOverlay'

type Props = {
  step: StepWithItems
  indices: StepIndices
  isReadOnly?: boolean
}

export const ItemNodesList = ({
  step,
  indices: { blockIndex, stepIndex },
  isReadOnly = false,
}: Props) => {
  const { typebot, createItem, detachItemFromStep } = useTypebot()
  const { draggedItem, setDraggedItem, mouseOverBlock } = useStepDnd()
  const placeholderRefs = useRef<HTMLDivElement[]>([])
  const { graphPosition } = useGraph()
  const blockId = typebot?.blocks[blockIndex].id
  const isDraggingOnCurrentBlock =
    (draggedItem && mouseOverBlock?.id === blockId) ?? false
  const showPlaceholders = draggedItem && !isReadOnly

  const isLastStep =
    typebot?.blocks[blockIndex].steps[stepIndex + 1] === undefined

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })
  const [expandedPlaceholderIndex, setExpandedPlaceholderIndex] = useState<
    number | undefined
  >()

  const handleGlobalMouseMove = (event: MouseEvent) => {
    if (!draggedItem || draggedItem.stepId !== step.id) return
    const { clientX, clientY } = event
    setPosition({
      ...position,
      x: clientX - relativeCoordinates.x,
      y: clientY - relativeCoordinates.y,
    })
  }
  useEventListener('mousemove', handleGlobalMouseMove)

  useEffect(() => {
    if (mouseOverBlock?.id !== step.blockId)
      setExpandedPlaceholderIndex(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseOverBlock?.id])

  const handleMouseMoveOnBlock = (event: MouseEvent) => {
    if (!isDraggingOnCurrentBlock || isReadOnly) return
    const index = computeNearestPlaceholderIndex(event.pageY, placeholderRefs)
    setExpandedPlaceholderIndex(index)
  }
  useEventListener(
    'mousemove',
    handleMouseMoveOnBlock,
    mouseOverBlock?.ref.current
  )

  const handleMouseUpOnBlock = (e: MouseEvent) => {
    setExpandedPlaceholderIndex(undefined)
    if (!isDraggingOnCurrentBlock) return
    const itemIndex = computeNearestPlaceholderIndex(e.pageY, placeholderRefs)
    e.stopPropagation()
    setDraggedItem(undefined)
    createItem(draggedItem as ButtonItem, {
      blockIndex,
      stepIndex,
      itemIndex,
    })
  }
  useEventListener(
    'mouseup',
    handleMouseUpOnBlock,
    mouseOverBlock?.ref.current,
    {
      capture: true,
    }
  )

  const handleStepMouseDown =
    (itemIndex: number) =>
    (
      { absolute, relative }: { absolute: Coordinates; relative: Coordinates },
      item: ButtonItem
    ) => {
      if (!typebot || isReadOnly) return
      placeholderRefs.current.splice(itemIndex + 1, 1)
      detachItemFromStep({ blockIndex, stepIndex, itemIndex })
      setPosition(absolute)
      setRelativeCoordinates(relative)
      setDraggedItem(item)
    }

  const stopPropagating = (e: React.MouseEvent) => e.stopPropagation()

  const handlePushElementRef =
    (idx: number) => (elem: HTMLDivElement | null) => {
      elem && (placeholderRefs.current[idx] = elem)
    }

  return (
    <Stack
      flex={1}
      spacing={1}
      maxW="full"
      onClick={stopPropagating}
      pointerEvents={isReadOnly ? 'none' : 'all'}
    >
      <Flex
        ref={handlePushElementRef(0)}
        h={showPlaceholders && expandedPlaceholderIndex === 0 ? '50px' : '2px'}
        bgColor={'gray.300'}
        visibility={showPlaceholders ? 'visible' : 'hidden'}
        rounded="lg"
        transition={showPlaceholders ? 'height 200ms' : 'none'}
      />
      {step.items.map((item, idx) => (
        <Stack key={item.id} spacing={1}>
          <ItemNode
            item={item}
            indices={{ blockIndex, stepIndex, itemIndex: idx }}
            onMouseDown={handleStepMouseDown(idx)}
            isReadOnly={isReadOnly}
          />
          <Flex
            ref={handlePushElementRef(idx + 1)}
            h={
              showPlaceholders && expandedPlaceholderIndex === idx + 1
                ? '50px'
                : '2px'
            }
            bgColor={'gray.300'}
            visibility={showPlaceholders ? 'visible' : 'hidden'}
            rounded="lg"
            transition={showPlaceholders ? 'height 200ms' : 'none'}
          />
        </Stack>
      ))}
      {isLastStep && (
        <Flex
          px="4"
          py="2"
          borderWidth="1px"
          borderColor="gray.300"
          bgColor={isReadOnly ? '' : 'gray.50'}
          rounded="md"
          pos="relative"
          align="center"
          cursor={isReadOnly ? 'pointer' : 'not-allowed'}
        >
          <Text color={isReadOnly ? 'inherit' : 'gray.500'}>Padrão</Text>
          <SourceEndpoint
            source={{
              blockId: step.blockId,
              stepId: step.id,
            }}
            pos="absolute"
            right="-49px"
          />
        </Flex>
      )}

      {draggedItem && draggedItem.stepId === step.id && (
        <Portal>
          <ItemNodeOverlay
            item={draggedItem}
            pos="fixed"
            top="0"
            left="0"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg) scale(${graphPosition.scale})`,
            }}
            transformOrigin="0 0 0"
          />
        </Portal>
      )}
    </Stack>
  )
}
