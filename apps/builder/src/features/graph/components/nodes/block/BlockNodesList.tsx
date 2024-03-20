import { useEventListener, Stack, Portal } from '@chakra-ui/react'
import { BlockV6 } from '@typebot.io/schemas'
import { useEffect, useRef, useState } from 'react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { BlockNode } from './BlockNode'
import { BlockNodeOverlay } from './BlockNodeOverlay'
import { PlaceholderNode } from '../PlaceholderNode'
import { isDefined } from '@typebot.io/lib'
import {
  useBlockDnd,
  computeNearestPlaceholderIndex,
} from '@/features/graph/providers/GraphDndProvider'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { Coordinates } from '@dnd-kit/utilities'

type Props = {
  blocks: BlockV6[]
  groupIndex: number
  groupRef: React.MutableRefObject<HTMLDivElement | null>
}
export const BlockNodesList = ({ blocks, groupIndex, groupRef }: Props) => {
  const {
    draggedBlock,
    setDraggedBlock,
    draggedBlockType,
    mouseOverGroup,
    setDraggedBlockType,
  } = useBlockDnd()
  const { typebot, createBlock, detachBlockFromGroup } = useTypebot()
  const { isReadOnly, graphPosition, setOpenedBlockId } = useGraph()
  const [expandedPlaceholderIndex, setExpandedPlaceholderIndex] = useState<
    number | undefined
  >()
  const placeholderRefs = useRef<HTMLDivElement[]>([])
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [mousePositionInElement, setMousePositionInElement] = useState({
    x: 0,
    y: 0,
  })
  const groupId = typebot?.groups.at(groupIndex)?.id
  const isDraggingOnCurrentGroup =
    (draggedBlock || draggedBlockType) && mouseOverGroup?.id === groupId
  const showSortPlaceholders = isDefined(draggedBlock || draggedBlockType)

  useEffect(() => {
    if (mouseOverGroup?.id !== groupId) setExpandedPlaceholderIndex(undefined)
  }, [groupId, mouseOverGroup?.id])

  const handleMouseMoveGlobal = (event: MouseEvent) => {
    if (!draggedBlock || draggedBlock.groupId !== groupId) return
    const { clientX, clientY } = event
    setPosition({
      x: clientX - mousePositionInElement.x,
      y: clientY - mousePositionInElement.y,
    })
  }

  const handleMouseMoveOnGroup = (event: MouseEvent) => {
    if (!isDraggingOnCurrentGroup) return
    setExpandedPlaceholderIndex(
      computeNearestPlaceholderIndex(event.pageY, placeholderRefs)
    )
  }

  const handleMouseUpOnGroup = (e: MouseEvent) => {
    setExpandedPlaceholderIndex(undefined)
    if (!isDraggingOnCurrentGroup || !groupId) return
    const blockIndex = computeNearestPlaceholderIndex(
      e.clientY,
      placeholderRefs
    )
    const blockId = createBlock(
      (draggedBlock || draggedBlockType) as BlockV6 | BlockV6['type'],
      {
        groupIndex,
        blockIndex,
      }
    )
    setDraggedBlock(undefined)
    setDraggedBlockType(undefined)
    if (blockId) setOpenedBlockId(blockId)
  }

  const handleBlockMouseDown =
    (blockIndex: number) =>
    (
      { relative, absolute }: { absolute: Coordinates; relative: Coordinates },
      block: BlockV6
    ) => {
      if (isReadOnly || !groupId) return
      placeholderRefs.current.splice(blockIndex + 1, 1)
      setMousePositionInElement(relative)
      setPosition({
        x: absolute.x - relative.x,
        y: absolute.y - relative.y,
      })
      setDraggedBlock({ ...block, groupId })
      detachBlockFromGroup({ groupIndex, blockIndex })
    }

  const handlePushElementRef =
    (idx: number) => (elem: HTMLDivElement | null) => {
      elem && (placeholderRefs.current[idx] = elem)
    }

  useEventListener('mousemove', handleMouseMoveGlobal)
  useEventListener('mousemove', handleMouseMoveOnGroup, groupRef.current)
  useEventListener('mouseup', handleMouseUpOnGroup, mouseOverGroup?.element, {
    capture: true,
  })

  return (
    <Stack spacing={1} transition="none">
      <PlaceholderNode
        isVisible={showSortPlaceholders}
        isExpanded={expandedPlaceholderIndex === 0}
        onRef={handlePushElementRef(0)}
      />
      {typebot &&
        blocks.map((block, idx) => (
          <Stack key={block.id} spacing={1}>
            <BlockNode
              key={block.id}
              block={block}
              indices={{ groupIndex, blockIndex: idx }}
              isConnectable={blocks.length - 1 === idx}
              onMouseDown={handleBlockMouseDown(idx)}
            />
            <PlaceholderNode
              isVisible={showSortPlaceholders}
              isExpanded={expandedPlaceholderIndex === idx + 1}
              onRef={handlePushElementRef(idx + 1)}
            />
          </Stack>
        ))}
      {draggedBlock && draggedBlock.groupId === groupId && (
        <Portal>
          <BlockNodeOverlay
            block={draggedBlock}
            indices={{ groupIndex, blockIndex: 0 }}
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
