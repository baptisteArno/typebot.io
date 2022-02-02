import {
  Flex,
  HStack,
  Popover,
  PopoverTrigger,
  useDisclosure,
  useEventListener,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import {
  BubbleStep,
  BubbleStepContent,
  DraggableStep,
  Step,
  StepOptions,
  TextBubbleStep,
  Webhook,
} from 'models'
import { Coordinates, useGraph } from 'contexts/GraphContext'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { isBubbleStep, isTextBubbleStep, isWebhookStep } from 'utils'
import { StepNodeContent } from './StepNodeContent/StepNodeContent'
import { useTypebot } from 'contexts/TypebotContext'
import { ContextMenu } from 'components/shared/ContextMenu'
import { SettingsPopoverContent } from './SettingsPopoverContent'
import { StepNodeContextMenu } from './StepNodeContextMenu'
import { SourceEndpoint } from '../../Endpoints/SourceEndpoint'
import { hasDefaultConnector } from 'services/typebots'
import { useRouter } from 'next/router'
import { SettingsModal } from './SettingsPopoverContent/SettingsModal'
import { StepSettings } from './SettingsPopoverContent/SettingsPopoverContent'
import { TextBubbleEditor } from './TextBubbleEditor'
import { TargetEndpoint } from '../../Endpoints'
import { MediaBubblePopoverContent } from './MediaBubblePopoverContent'

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
  const {
    setConnectingIds,
    connectingIds,
    openedStepId,
    setOpenedStepId,
    blocksCoordinates,
  } = useGraph()
  const { detachStepFromBlock, updateStep, typebot, updateWebhook } =
    useTypebot()
  const [localStep, setLocalStep] = useState(step)
  const [localWebhook, setLocalWebhook] = useState(
    isWebhookStep(step)
      ? typebot?.webhooks.byId[step.options.webhookId ?? '']
      : undefined
  )
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPopoverOpened, setIsPopoverOpened] = useState(
    openedStepId === step.id
  )

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
    setLocalStep(step)
  }, [step])

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

  const handleModalClose = () => {
    updateStep(localStep.id, { ...localStep })
    onModalClose()
  }

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
      detachStepFromBlock(step.id)
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

  const updateOptions = () => {
    updateStep(localStep.id, { ...localStep })
    if (localWebhook) updateWebhook(localWebhook.id, { ...localWebhook })
  }

  const handleOptionsChange = (options: StepOptions) => {
    setLocalStep({ ...localStep, options } as Step)
  }

  const handleContentChange = (content: BubbleStepContent) =>
    setLocalStep({ ...localStep, content } as Step)

  const handleWebhookChange = (updates: Partial<Webhook>) => {
    if (!localWebhook) return
    setLocalWebhook({ ...localWebhook, ...updates })
  }

  useEffect(() => {
    if (isPopoverOpened && openedStepId !== step.id) updateOptions()
    setIsPopoverOpened(openedStepId === step.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedStepId])

  return isEditing && isTextBubbleStep(localStep) ? (
    <TextBubbleEditor
      stepId={localStep.id}
      initialValue={localStep.content.richText}
      onClose={handleCloseEditor}
    />
  ) : (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <StepNodeContextMenu stepId={step.id} />}
    >
      {(ref, isOpened) => (
        <Popover
          placement="left"
          isLazy
          isOpen={isPopoverOpened}
          closeOnBlur={false}
        >
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
                  type={localStep.type}
                  mt="1"
                  data-testid={`${localStep.id}-icon`}
                />
                <StepNodeContent step={localStep} />
                <TargetEndpoint
                  pos="absolute"
                  left="-32px"
                  top="19px"
                  stepId={localStep.id}
                />
                {blocksCoordinates &&
                  isConnectable &&
                  hasDefaultConnector(localStep) && (
                    <SourceEndpoint
                      source={{
                        blockId: localStep.blockId,
                        stepId: localStep.id,
                      }}
                      pos="absolute"
                      right="15px"
                      bottom="18px"
                    />
                  )}
              </HStack>
            </Flex>
          </PopoverTrigger>
          {hasSettingsPopover(localStep) && (
            <SettingsPopoverContent
              step={localStep}
              webhook={localWebhook}
              onExpandClick={handleExpandClick}
              onOptionsChange={handleOptionsChange}
              onWebhookChange={handleWebhookChange}
              onTestRequestClick={updateOptions}
            />
          )}
          {isMediaBubbleStep(localStep) && (
            <MediaBubblePopoverContent
              step={localStep}
              onContentChange={handleContentChange}
            />
          )}
          <SettingsModal isOpen={isModalOpen} onClose={handleModalClose}>
            <StepSettings
              step={localStep}
              webhook={localWebhook}
              onOptionsChange={handleOptionsChange}
              onWebhookChange={handleWebhookChange}
              onTestRequestClick={updateOptions}
            />
          </SettingsModal>
        </Popover>
      )}
    </ContextMenu>
  )
}

const hasSettingsPopover = (step: Step): step is Exclude<Step, BubbleStep> =>
  !isBubbleStep(step)

const isMediaBubbleStep = (
  step: Step
): step is Exclude<BubbleStep, TextBubbleStep> =>
  isBubbleStep(step) && !isTextBubbleStep(step)
