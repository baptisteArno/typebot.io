import {
  Flex,
  HStack,
  Popover,
  PopoverTrigger,
  useDisclosure,
  useEventListener,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { BubbleStep, DraggableStep, Step, TextBubbleStep } from 'models'
import { Coordinates, useGraph } from 'contexts/GraphContext'
import { StepIcon } from 'components/board/StepsSideBar/StepIcon'
import { isBubbleStep, isTextBubbleStep } from 'utils'
import { TextEditor } from './TextEditor/TextEditor'
import { StepNodeContent } from './StepNodeContent/StepNodeContent'
import { useTypebot } from 'contexts/TypebotContext'
import { ContextMenu } from 'components/shared/ContextMenu'
import { SettingsPopoverContent } from './SettingsPopoverContent'
import { StepNodeContextMenu } from './StepNodeContextMenu'
import { SourceEndpoint } from './SourceEndpoint'
import { hasDefaultConnector } from 'services/typebots'
import { TargetEndpoint } from './TargetEndpoint'
import { useRouter } from 'next/router'
import { SettingsModal } from './SettingsPopoverContent/SettingsModal'
import { StepSettings } from './SettingsPopoverContent/SettingsPopoverContent'
import { ContentPopover } from './ContentPopover'

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
  const { query } = useRouter()
  const { setConnectingIds, connectingIds, openedStepId, setOpenedStepId } =
    useGraph()
  const { moveStep } = useTypebot()
  const [isConnecting, setIsConnecting] = useState(false)
  const [mouseDownEvent, setMouseDownEvent] =
    useState<{ absolute: Coordinates; relative: Coordinates }>()
  const [isEditing, setIsEditing] = useState<boolean>(
    isTextBubbleStep(step) && step.content.plainText === ''
  )
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure()

  useEffect(() => {
    if (query.stepId?.toString() === step.id) setOpenedStepId(step.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpenedStepId(step.id)
  }

  const handleExpandClick = () => {
    setOpenedStepId(undefined)
    onModalOpen()
  }

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
        <Popover placement="bottom" isLazy isOpen={openedStepId === step.id}>
          <PopoverTrigger>
            <Flex
              pos="relative"
              ref={ref}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onClick={handleClick}
              data-testid={`step-${step.id}`}
              w="full"
            >
              <HStack
                flex="1"
                userSelect="none"
                p="3"
                borderWidth="1px"
                borderColor={isConnecting || isOpened ? 'blue.400' : 'gray.300'}
                rounded="lg"
                cursor={'pointer'}
                bgColor="white"
                align="flex-start"
                w="full"
              >
                <StepIcon
                  type={step.type}
                  mt="1"
                  data-testid={`${step.id}-icon`}
                />
                <StepNodeContent step={step} />
                <TargetEndpoint
                  pos="absolute"
                  left="-32px"
                  top="19px"
                  stepId={step.id}
                />
                {isConnectable && hasDefaultConnector(step) && (
                  <SourceEndpoint
                    source={{
                      blockId: step.blockId,
                      stepId: step.id,
                    }}
                    pos="absolute"
                    right="15px"
                    bottom="18px"
                  />
                )}
              </HStack>
            </Flex>
          </PopoverTrigger>
          {hasSettingsPopover(step) && (
            <SettingsPopoverContent
              step={step}
              onExpandClick={handleExpandClick}
            />
          )}
          {hasContentPopover(step) && <ContentPopover step={step} />}
          <SettingsModal isOpen={isModalOpen} onClose={onModalClose}>
            <StepSettings step={step} />
          </SettingsModal>
        </Popover>
      )}
    </ContextMenu>
  )
}

const hasSettingsPopover = (step: Step): step is Exclude<Step, BubbleStep> =>
  !isBubbleStep(step)

const hasContentPopover = (
  step: Step
): step is Exclude<BubbleStep, TextBubbleStep> =>
  isBubbleStep(step) && !isTextBubbleStep(step)
