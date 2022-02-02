import {
  Editable,
  EditableInput,
  EditablePreview,
  Stack,
  useEventListener,
} from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { Block } from 'models'
import { useGraph } from 'contexts/GraphContext'
import { useStepDnd } from 'contexts/StepDndContext'
import { StepNodesList } from '../StepNode/StepNodesList'
import { isNotDefined } from 'utils'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { ContextMenu } from 'components/shared/ContextMenu'
import { BlockNodeContextMenu } from './BlockNodeContextMenu'
import { useDebounce } from 'use-debounce'

type Props = {
  block: Block
}

export const BlockNode = ({ block }: Props) => {
  const {
    connectingIds,
    setConnectingIds,
    previewingEdgeId,
    blocksCoordinates,
    updateBlockCoordinates,
    isReadOnly,
  } = useGraph()
  const { typebot, updateBlock } = useTypebot()
  const { setMouseOverBlockId } = useStepDnd()
  const { draggedStep, draggedStepType } = useStepDnd()
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const isPreviewing = useMemo(() => {
    if (!previewingEdgeId) return
    const edge = typebot?.edges.byId[previewingEdgeId]
    return edge?.to.blockId === block.id || edge?.from.blockId === block.id
  }, [block.id, previewingEdgeId, typebot?.edges.byId])

  const blockCoordinates = useMemo(
    () => blocksCoordinates?.byId[block.id],
    [block.id, blocksCoordinates?.byId]
  )
  const [debouncedBlockPosition] = useDebounce(blockCoordinates, 100)
  useEffect(() => {
    if (!debouncedBlockPosition || isReadOnly) return
    if (
      debouncedBlockPosition?.x === block.graphCoordinates.x &&
      debouncedBlockPosition.y === block.graphCoordinates.y
    )
      return
    updateBlock(block.id, { graphCoordinates: debouncedBlockPosition })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBlockPosition])

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.blockId === block.id &&
        isNotDefined(connectingIds.target?.stepId)
    )
  }, [block.id, connectingIds])

  const handleTitleSubmit = (title: string) => updateBlock(block.id, { title })

  const handleMouseDown = () => {
    setIsMouseDown(true)
  }
  const handleMouseUp = () => {
    setIsMouseDown(false)
  }
  useEventListener('mouseup', handleMouseUp)

  const handleMouseMove = (event: MouseEvent) => {
    if (!isMouseDown) return
    const { movementX, movementY } = event

    if (!blockCoordinates) return
    updateBlockCoordinates(block.id, {
      x: blockCoordinates.x + movementX,
      y: blockCoordinates.y + movementY,
    })
  }

  useEventListener('mousemove', handleMouseMove)

  const handleMouseEnter = () => {
    if (draggedStepType || draggedStep) setMouseOverBlockId(block.id)
    if (connectingIds)
      setConnectingIds({ ...connectingIds, target: { blockId: block.id } })
  }

  const handleMouseLeave = () => {
    setMouseOverBlockId(undefined)
    if (connectingIds) setConnectingIds({ ...connectingIds, target: undefined })
  }

  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <BlockNodeContextMenu blockId={block.id} />}
      isDisabled={isReadOnly}
    >
      {(ref, isOpened) => (
        <Stack
          ref={ref}
          p="4"
          rounded="lg"
          bgColor="blue.50"
          backgroundImage="linear-gradient(rgb(235, 239, 244), rgb(231, 234, 241))"
          borderWidth="2px"
          borderColor={
            isConnecting || isOpened || isPreviewing ? 'blue.400' : 'white'
          }
          w="300px"
          transition="border 300ms, box-shadow 200ms"
          pos="absolute"
          style={{
            transform: `translate(${blockCoordinates?.x ?? 0}px, ${
              blockCoordinates?.y ?? 0
            }px)`,
          }}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          cursor={isMouseDown ? 'grabbing' : 'pointer'}
          boxShadow="0px 0px 0px 1px #e9edf3;"
          _hover={{ shadow: 'lg' }}
        >
          <Editable
            defaultValue={block.title}
            onSubmit={handleTitleSubmit}
            fontWeight="semibold"
            isDisabled={isReadOnly}
          >
            <EditablePreview
              _hover={{ bgColor: 'gray.300' }}
              px="1"
              userSelect={'none'}
            />
            <EditableInput minW="0" px="1" />
          </Editable>
          {typebot && (
            <StepNodesList blockId={block.id} stepIds={block.stepIds} />
          )}
        </Stack>
      )}
    </ContextMenu>
  )
}
