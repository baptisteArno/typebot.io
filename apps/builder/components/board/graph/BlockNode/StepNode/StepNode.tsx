import {
  Box,
  Flex,
  HStack,
  Popover,
  PopoverTrigger,
  useEventListener,
} from '@chakra-ui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { Block, Step } from 'models'
import { useGraph } from 'contexts/GraphContext'
import { StepIcon } from 'components/board/StepTypesList/StepIcon'
import {
  isChoiceInput,
  isDefined,
  isInputStep,
  isLogicStep,
  isTextBubbleStep,
} from 'utils'
import { Coordinates } from '@dnd-kit/core/dist/types'
import { TextEditor } from './TextEditor/TextEditor'
import { StepNodeContent } from './StepNodeContent'
import { useTypebot } from 'contexts/TypebotContext'
import { ContextMenu } from 'components/shared/ContextMenu'
import { SettingsPopoverContent } from './SettingsPopoverContent'
import { DraggableStep } from 'contexts/DndContext'
import { StepNodeContextMenu } from './StepNodeContextMenu'
import { SourceEndpoint } from './SourceEndpoint'

export const StepNode = ({
  step,
  isConnectable,
  onMouseMoveBottomOfElement,
  onMouseMoveTopOfElement,
  onMouseDown,
}: {
  step: Step
  isConnectable: boolean
  onMouseMoveBottomOfElement?: () => void
  onMouseMoveTopOfElement?: () => void
  onMouseDown?: (
    stepNodePosition: { absolute: Coordinates; relative: Coordinates },
    step: DraggableStep
  ) => void
}) => {
  const { setConnectingIds, connectingIds } = useGraph()
  const { moveStep, typebot } = useTypebot()
  const [isConnecting, setIsConnecting] = useState(false)
  const [mouseDownEvent, setMouseDownEvent] =
    useState<{ absolute: Coordinates; relative: Coordinates }>()
  const [isEditing, setIsEditing] = useState<boolean>(
    isTextBubbleStep(step) && step.content.plainText === ''
  )

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
    if (isMovingAndIsMouseDown && step.type !== 'start') {
      onMouseDown(mouseDownEvent, step)
      moveStep(step.id)
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
    if (!typebot) return
    const currentBlock = typebot.blocks?.byId[step.blockId]
    const isDragginConnectorFromCurrentBlock =
      connectingIds?.source.blockId === currentBlock?.id &&
      connectingIds?.target?.blockId
    const targetBlockId = isDragginConnectorFromCurrentBlock
      ? connectingIds.target?.blockId
      : step.target?.blockId
    const targetedBlock = targetBlockId && typebot.blocks.byId[targetBlockId]
    return targetedBlock
      ? targetedBlock.graphCoordinates.x <
        (currentBlock as Block).graphCoordinates.x
        ? 'left'
        : 'right'
      : undefined
  }, [
    typebot,
    step.blockId,
    step.target?.blockId,
    connectingIds?.source.blockId,
    connectingIds?.target?.blockId,
  ])

  return isEditing && isTextBubbleStep(step) ? (
    <TextEditor
      stepId={step.id}
      initialValue={step.content.richText}
      onClose={handleCloseEditor}
    />
  ) : (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <StepNodeContextMenu stepId={step.id} />}
    >
      {(ref, isOpened) => (
        <Popover placement="left" isLazy>
          <PopoverTrigger>
            <Flex
              pos="relative"
              ref={ref}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              data-testid={`step-${step.id}`}
              w="full"
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
                align="flex-start"
              >
                <StepIcon type={step.type} mt="1" />
                <StepNodeContent step={step} />
                {isConnectable && !isChoiceInput(step) && (
                  <SourceEndpoint
                    source={{
                      blockId: step.blockId,
                      stepId: step.id,
                    }}
                    pos="absolute"
                    right="15px"
                    top="19px"
                  />
                )}
              </HStack>

              {isDefined(connectedStubPosition) && !isChoiceInput(step) && (
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
          </PopoverTrigger>
          {(isInputStep(step) || isLogicStep(step)) && (
            <SettingsPopoverContent step={step} />
          )}
        </Popover>
      )}
    </ContextMenu>
  )
}
