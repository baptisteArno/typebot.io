import { Box, Flex, HStack, useEventListener } from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { Block, StartStep, Step, StepType } from 'bot-engine'
import { SourceEndpoint } from './SourceEndpoint'
import { useGraph } from 'contexts/GraphContext'
import { StepIcon } from 'components/board/StepTypesList/StepIcon'
import { isDefined } from 'utils'
import { Coordinates } from '@dnd-kit/core/dist/types'
import { TextEditor } from './TextEditor/TextEditor'
import { StepContent } from './StepContent'
import { useTypebot } from 'contexts/TypebotContext'
import { ContextMenu } from 'components/shared/ContextMenu'
import { StepNodeContextMenu } from './RightClickMenu'

export const StepNode = ({
  step,
  isConnectable,
  onMouseMoveBottomOfElement,
  onMouseMoveTopOfElement,
  onMouseDown,
}: {
  step: Step | StartStep
  isConnectable: boolean
  onMouseMoveBottomOfElement?: () => void
  onMouseMoveTopOfElement?: () => void
  onMouseDown?: (
    stepNodePosition: { absolute: Coordinates; relative: Coordinates },
    step: Step
  ) => void
}) => {
  const { setConnectingIds, connectingIds } = useGraph()
  const { removeStepFromBlock, typebot } = useTypebot()
  const { blocks, startBlock } = typebot ?? {}
  const [isConnecting, setIsConnecting] = useState(false)
  const [mouseDownEvent, setMouseDownEvent] =
    useState<{ absolute: Coordinates; relative: Coordinates }>()
  const [isEditing, setIsEditing] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    setIsConnecting(
      connectingIds?.target?.blockId === step.blockId &&
        connectingIds?.target?.stepId === step.id
    )
  }, [connectingIds, step.blockId, step.id])

  const handleMouseEnter = () => {
    if (connectingIds?.target)
      setConnectingIds({
        ...connectingIds,
        target: { ...connectingIds.target, stepId: step.id },
      })
  }

  const handleMouseLeave = () => {
    if (connectingIds?.target)
      setConnectingIds({
        ...connectingIds,
        target: { ...connectingIds.target, stepId: undefined },
      })
  }

  const handleConnectionDragStart = () => {
    setConnectingIds({ blockId: step.blockId, stepId: step.id })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onMouseDown) return
    e.stopPropagation()
    const element = e.currentTarget as HTMLDivElement
    const rect = element.getBoundingClientRect()
    const relativeX = e.clientX - rect.left
    const relativeY = e.clientY - rect.top
    setMouseDownEvent({
      absolute: { x: e.clientX + relativeX, y: e.clientY + relativeY },
      relative: { x: relativeX, y: relativeY },
    })
  }

  const handleGlobalMouseUp = () => {
    setMouseDownEvent(undefined)
  }
  useEventListener('mouseup', handleGlobalMouseUp)

  const handleMouseUp = () => {
    if (mouseDownEvent) {
      setIsEditing(true)
    }
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onMouseMoveBottomOfElement || !onMouseMoveTopOfElement) return
    const isMovingAndIsMouseDown =
      mouseDownEvent &&
      onMouseDown &&
      (event.movementX > 0 || event.movementY > 0)
    if (isMovingAndIsMouseDown) {
      onMouseDown(mouseDownEvent, step as Step)
      removeStepFromBlock(step.blockId, step.id)
      setMouseDownEvent(undefined)
    }
    const element = event.currentTarget as HTMLDivElement
    const rect = element.getBoundingClientRect()
    const y = event.clientY - rect.top
    if (y > rect.height / 2) onMouseMoveBottomOfElement()
    else onMouseMoveTopOfElement()
  }

  const handleCloseEditor = () => {
    setIsEditing(false)
  }

  const connectedStubPosition: 'right' | 'left' | undefined = useMemo(() => {
    const currentBlock = [startBlock, ...(blocks ?? [])].find(
      (b) => b?.id === step.blockId
    )
    const isDragginConnectorFromCurrentBlock =
      connectingIds?.blockId === currentBlock?.id &&
      connectingIds?.target?.blockId
    const targetBlockId = isDragginConnectorFromCurrentBlock
      ? connectingIds.target?.blockId
      : step.target?.blockId
    const targetedBlock = targetBlockId
      ? (blocks ?? []).find((b) => b.id === targetBlockId)
      : undefined
    return targetedBlock
      ? targetedBlock.graphCoordinates.x <
        (currentBlock as Block).graphCoordinates.x
        ? 'left'
        : 'right'
      : undefined
  }, [
    blocks,
    connectingIds?.blockId,
    connectingIds?.target?.blockId,
    step.blockId,
    step.target?.blockId,
    startBlock,
  ])

  return step.type === StepType.TEXT &&
    (isEditing ||
      (isEditing === undefined && step.content.plainText === '')) ? (
    <TextEditor
      ids={{ stepId: step.id, blockId: step.blockId }}
      initialValue={step.content.richText}
      onClose={handleCloseEditor}
    />
  ) : (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => (
        <StepNodeContextMenu blockId={step.blockId} stepId={step.id} />
      )}
    >
      {(ref, isOpened) => (
        <Flex
          pos="relative"
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
        >
          {connectedStubPosition === 'left' && (
            <Box
              h="2px"
              pos="absolute"
              left="-18px"
              top="25px"
              w="18px"
              bgColor="blue.500"
            />
          )}
          <HStack
            flex="1"
            userSelect="none"
            p="3"
            borderWidth="2px"
            borderColor={isConnecting || isOpened ? 'blue.400' : 'gray.400'}
            rounded="lg"
            cursor={'pointer'}
            bgColor="white"
          >
            <StepIcon type={step.type} />
            <StepContent {...step} />
            {isConnectable && (
              <SourceEndpoint
                onConnectionDragStart={handleConnectionDragStart}
                pos="absolute"
                right="20px"
              />
            )}
          </HStack>

          {isDefined(connectedStubPosition) && (
            <Box
              h="2px"
              pos="absolute"
              right={connectedStubPosition === 'left' ? undefined : '-18px'}
              left={connectedStubPosition === 'left' ? '-18px' : undefined}
              top="25px"
              w="18px"
              bgColor="gray.500"
            />
          )}
        </Flex>
      )}
    </ContextMenu>
  )
}
