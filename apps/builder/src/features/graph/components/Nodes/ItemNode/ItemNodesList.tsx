import { Flex, Portal, Stack, Text, useEventListener } from '@chakra-ui/react'
import {
  computeNearestPlaceholderIndex,
  useBlockDnd,
  Coordinates,
  useGraph,
} from '../../../providers'
import { useTypebot } from '@/features/editor'
import { BlockIndices, BlockWithItems, LogicBlockType, Item } from 'models'
import React, { useEffect, useRef, useState } from 'react'
import { ItemNode } from './ItemNode'
import { SourceEndpoint } from '../../Endpoints'

type Props = {
  block: BlockWithItems
  indices: BlockIndices
}

export const ItemNodesList = ({
  block,
  indices: { groupIndex, blockIndex },
}: Props) => {
  const { typebot, createItem, detachItemFromBlock } = useTypebot()
  const { draggedItem, setDraggedItem, mouseOverBlock } = useBlockDnd()
  const placeholderRefs = useRef<HTMLDivElement[]>([])
  const { graphPosition } = useGraph()
  const isDraggingOnCurrentBlock =
    (draggedItem && mouseOverBlock?.id === block.id) ?? false
  const showPlaceholders =
    draggedItem !== undefined && block.items[0].type === draggedItem.type

  const isLastBlock =
    typebot?.groups[groupIndex].blocks[blockIndex + 1] === undefined

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })
  const [expandedPlaceholderIndex, setExpandedPlaceholderIndex] = useState<
    number | undefined
  >()

  const handleGlobalMouseMove = (event: MouseEvent) => {
    if (!draggedItem || draggedItem.blockId !== block.id) return
    const { clientX, clientY } = event
    setPosition({
      ...position,
      x: clientX - relativeCoordinates.x,
      y: clientY - relativeCoordinates.y,
    })
  }
  useEventListener('mousemove', handleGlobalMouseMove)

  useEffect(() => {
    if (!showPlaceholders) return
    if (mouseOverBlock?.id !== block.id) {
      setExpandedPlaceholderIndex(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseOverBlock?.id, showPlaceholders])

  const handleMouseMoveOnBlock = (event: MouseEvent) => {
    if (!isDraggingOnCurrentBlock) return
    const index = computeNearestPlaceholderIndex(event.pageY, placeholderRefs)
    setExpandedPlaceholderIndex(index)
  }
  useEventListener(
    'mousemove',
    handleMouseMoveOnBlock,
    mouseOverBlock?.ref.current
  )

  const handleMouseUpOnGroup = (e: MouseEvent) => {
    if (
      !showPlaceholders ||
      !isDraggingOnCurrentBlock ||
      !draggedItem ||
      mouseOverBlock?.id !== block.id
    )
      return
    setExpandedPlaceholderIndex(undefined)
    const itemIndex = computeNearestPlaceholderIndex(e.pageY, placeholderRefs)
    e.stopPropagation()
    setDraggedItem(undefined)
    createItem(draggedItem, {
      groupIndex,
      blockIndex,
      itemIndex,
    })
  }
  useEventListener(
    'mouseup',
    handleMouseUpOnGroup,
    mouseOverBlock?.ref.current,
    {
      capture: true,
    }
  )

  const handleBlockMouseDown =
    (itemIndex: number) =>
    (
      { absolute, relative }: { absolute: Coordinates; relative: Coordinates },
      item: Item
    ) => {
      if (!typebot || block.items.length <= 1) return
      placeholderRefs.current.splice(itemIndex + 1, 1)
      detachItemFromBlock({ groupIndex, blockIndex, itemIndex })
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
    <Stack flex={1} spacing={1} maxW="full" onClick={stopPropagating}>
      <Flex
        ref={handlePushElementRef(0)}
        h={showPlaceholders && expandedPlaceholderIndex === 0 ? '50px' : '2px'}
        bgColor={'gray.300'}
        visibility={showPlaceholders ? 'visible' : 'hidden'}
        rounded="lg"
        transition={showPlaceholders ? 'height 200ms' : 'none'}
      />
      {block.items.map((item, idx) => (
        <Stack key={item.id} spacing={1}>
          <ItemNode
            item={item}
            indices={{ groupIndex, blockIndex, itemIndex: idx }}
            onMouseDown={handleBlockMouseDown(idx)}
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
      {isLastBlock && (
        <Flex
          px="4"
          py="2"
          borderWidth="1px"
          borderColor="gray.300"
          bgColor={'gray.50'}
          rounded="md"
          pos="relative"
          align="center"
          cursor="not-allowed"
        >
          <Text color="gray.500">
            {block.type === LogicBlockType.CONDITION ? 'Else' : 'Default'}
          </Text>
          <SourceEndpoint
            source={{
              groupId: block.groupId,
              blockId: block.id,
            }}
            pos="absolute"
            right="-49px"
          />
        </Flex>
      )}

      {draggedItem && draggedItem.blockId === block.id && (
        <Portal>
          <Flex
            pointerEvents="none"
            pos="fixed"
            top="0"
            left="0"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg) scale(${graphPosition.scale})`,
            }}
            w="220px"
            transformOrigin="0 0 0"
          >
            <ItemNode
              item={draggedItem}
              indices={{ groupIndex, blockIndex, itemIndex: 0 }}
              connectionDisabled
            />
          </Flex>
        </Portal>
      )}
    </Stack>
  )
}
