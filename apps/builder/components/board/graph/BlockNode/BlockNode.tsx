import {
  Editable,
  EditableInput,
  EditablePreview,
  Stack,
  useEventListener,
} from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import { Block, StartBlock } from 'bot-engine'
import { useGraph } from 'contexts/GraphContext'
import { useDnd } from 'contexts/DndContext'
import { StepsList } from './StepsList'
import { isNotDefined } from 'services/utils'

export const BlockNode = ({ block }: { block: Block | StartBlock }) => {
  const {
    updateBlockPosition,
    addNewStepToBlock,
    connectingIds,
    setConnectingIds,
  } = useGraph()
  const { draggedStep, draggedStepType, setDraggedStepType, setDraggedStep } =
    useDnd()
  const blockRef = useRef<HTMLDivElement | null>(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [titleValue, setTitleValue] = useState(block.title)
  const [showSortPlaceholders, setShowSortPlaceholders] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.blockId === block.id &&
        isNotDefined(connectingIds.target?.stepId)
    )
  }, [block.id, connectingIds])

  const handleTitleChange = (title: string) => setTitleValue(title)

  const handleMouseDown = () => {
    setIsMouseDown(true)
  }
  const handleMouseUp = () => {
    setIsMouseDown(false)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isMouseDown) return
    const { movementX, movementY } = event

    updateBlockPosition(block.id, {
      x: block.graphCoordinates.x + movementX,
      y: block.graphCoordinates.y + movementY,
    })
  }

  useEventListener('mousemove', handleMouseMove)

  const handleMouseEnter = () => {
    if (draggedStepType || draggedStep) setShowSortPlaceholders(true)
    if (connectingIds)
      setConnectingIds({ ...connectingIds, target: { blockId: block.id } })
  }

  const handleMouseLeave = () => {
    setShowSortPlaceholders(false)
    if (connectingIds) setConnectingIds({ ...connectingIds, target: undefined })
  }

  const handleStepDrop = (index: number) => {
    setShowSortPlaceholders(false)
    if (draggedStepType) {
      addNewStepToBlock(block.id, draggedStepType, index)
      setDraggedStepType(undefined)
    }
    if (draggedStep) {
      addNewStepToBlock(block.id, draggedStep, index)
      setDraggedStep(undefined)
    }
  }

  return (
    <Stack
      p="4"
      rounded="lg"
      bgColor="blue.50"
      borderWidth="2px"
      borderColor={isConnecting ? 'blue.400' : 'gray.400'}
      minW="300px"
      transition="border 300ms"
      pos="absolute"
      style={{
        transform: `translate(${block.graphCoordinates.x}px, ${block.graphCoordinates.y}px)`,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={blockRef}
    >
      <Editable value={titleValue} onChange={handleTitleChange}>
        <EditablePreview _hover={{ bgColor: 'blue.100' }} px="1" />
        <EditableInput minW="0" px="1" />
      </Editable>
      <StepsList
        blockId={block.id}
        steps={block.steps}
        showSortPlaceholders={showSortPlaceholders}
        onMouseUp={handleStepDrop}
      />
    </Stack>
  )
}
