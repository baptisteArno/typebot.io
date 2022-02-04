import {
  Editable,
  EditableInput,
  EditablePreview,
  Stack,
  useEventListener,
} from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import { Block } from 'models'
import { useGraph } from 'contexts/GraphContext'
import { useStepDnd } from 'contexts/GraphDndContext'
import { StepNodesList } from '../StepNode/StepNodesList'
import { isNotDefined } from 'utils'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import { ContextMenu } from 'components/shared/ContextMenu'
import { BlockNodeContextMenu } from './BlockNodeContextMenu'
import { useDebounce } from 'use-debounce'
import { setMultipleRefs } from 'services/utils'

type Props = {
  block: Block
  blockIndex: number
}

export const BlockNode = ({ block, blockIndex }: Props) => {
  const {
    connectingIds,
    setConnectingIds,
    previewingEdge,
    blocksCoordinates,
    updateBlockCoordinates,
    isReadOnly,
  } = useGraph()
  const { typebot, updateBlock } = useTypebot()
  const { setMouseOverBlock, mouseOverBlock } = useStepDnd()
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const isPreviewing =
    previewingEdge?.to.blockId === block.id ||
    previewingEdge?.from.blockId === block.id
  const isStartBlock =
    block.steps.length === 1 && block.steps[0].type === 'start'

  const blockCoordinates = blocksCoordinates[block.id]
  const blockRef = useRef<HTMLDivElement | null>(null)
  const [debouncedBlockPosition] = useDebounce(blockCoordinates, 100)
  useEffect(() => {
    if (!debouncedBlockPosition || isReadOnly) return
    if (
      debouncedBlockPosition?.x === block.graphCoordinates.x &&
      debouncedBlockPosition.y === block.graphCoordinates.y
    )
      return
    updateBlock(blockIndex, { graphCoordinates: debouncedBlockPosition })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedBlockPosition])

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.blockId === block.id &&
        isNotDefined(connectingIds.target?.stepId)
    )
  }, [block.id, connectingIds])

  const handleTitleSubmit = (title: string) =>
    updateBlock(blockIndex, { title })

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
    if (mouseOverBlock?.id !== block.id && !isStartBlock)
      setMouseOverBlock({ id: block.id, ref: blockRef })
    if (connectingIds)
      setConnectingIds({ ...connectingIds, target: { blockId: block.id } })
  }

  const handleMouseLeave = () => {
    setMouseOverBlock(undefined)
    if (connectingIds) setConnectingIds({ ...connectingIds, target: undefined })
  }

  return (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <BlockNodeContextMenu blockIndex={blockIndex} />}
      isDisabled={isReadOnly}
    >
      {(ref, isOpened) => (
        <Stack
          ref={setMultipleRefs([ref, blockRef])}
          data-testid="block"
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
            <StepNodesList
              blockId={block.id}
              steps={block.steps}
              blockIndex={blockIndex}
              blockRef={ref}
              isStartBlock={isStartBlock}
            />
          )}
        </Stack>
      )}
    </ContextMenu>
  )
}
