import {
  Flex,
  Portal,
  Stack,
  Text,
  useColorModeValue,
  useEventListener,
} from '@chakra-ui/react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import {
  BlockIndices,
  BlockWithItems,
  LogicBlockType,
} from '@typebot.io/schemas'
import React, { useEffect, useRef, useState } from 'react'
import { ItemNode } from './ItemNode'
import { PlaceholderNode } from '../PlaceholderNode'
import { isDefined } from '@typebot.io/lib'
import {
  useBlockDnd,
  computeNearestPlaceholderIndex,
  DraggabbleItem,
} from '@/features/graph/providers/GraphDndProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { Coordinates } from '@dnd-kit/utilities'
import { SourceEndpoint } from '../../endpoints/SourceEndpoint'

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
    draggedItem !== undefined && block.items.at(0)?.type === draggedItem.type

  const isLastBlock =
    isDefined(typebot) &&
    typebot.groups[groupIndex]?.blocks?.[blockIndex + 1] === undefined

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
  }, [block.id, mouseOverBlock?.id, showPlaceholders])

  const handleMouseMoveOnBlock = (event: MouseEvent) => {
    if (!isDraggingOnCurrentBlock) return
    const index = computeNearestPlaceholderIndex(event.pageY, placeholderRefs)
    setExpandedPlaceholderIndex(index)
  }
  useEventListener('mousemove', handleMouseMoveOnBlock, mouseOverBlock?.element)

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
  useEventListener('mouseup', handleMouseUpOnGroup, mouseOverBlock?.element, {
    capture: true,
  })

  const handleBlockMouseDown =
    (itemIndex: number) =>
    (
      { absolute, relative }: { absolute: Coordinates; relative: Coordinates },
      item: DraggabbleItem
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
      <PlaceholderNode
        isVisible={showPlaceholders}
        isExpanded={expandedPlaceholderIndex === 0}
        onRef={handlePushElementRef(0)}
      />
      {block.items.map((item, idx) => (
        <Stack key={item.id} spacing={1}>
          <ItemNode
            item={item}
            indices={{ groupIndex, blockIndex, itemIndex: idx }}
            onMouseDown={handleBlockMouseDown(idx)}
          />
          <PlaceholderNode
            isVisible={showPlaceholders}
            isExpanded={expandedPlaceholderIndex === idx + 1}
            onRef={handlePushElementRef(idx + 1)}
          />
        </Stack>
      ))}
      {isLastBlock && <DefaultItemNode block={block} />}

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

const DefaultItemNode = ({ block }: { block: BlockWithItems }) => {
  return (
    <Flex
      px="4"
      py="2"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.300', undefined)}
      bgColor={useColorModeValue('gray.50', 'gray.850')}
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
  )
}
