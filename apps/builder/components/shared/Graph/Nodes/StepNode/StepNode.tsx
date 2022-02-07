import {
  Flex,
  HStack,
  Popover,
  PopoverTrigger,
  useDisclosure,
} from '@chakra-ui/react'
import React, { useEffect, useRef, useState } from 'react'
import {
  BubbleStep,
  BubbleStepContent,
  DraggableStep,
  Step,
  TextBubbleContent,
  TextBubbleStep,
} from 'models'
import { useGraph } from 'contexts/GraphContext'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { isBubbleStep, isTextBubbleStep } from 'utils'
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
import { NodePosition, useDragDistance } from 'contexts/GraphDndContext'
import { setMultipleRefs } from 'services/utils'

export const StepNode = ({
  step,
  isConnectable,
  indices,
  onMouseDown,
}: {
  step: Step
  isConnectable: boolean
  indices: { stepIndex: number; blockIndex: number }
  onMouseDown?: (stepNodePosition: NodePosition, step: DraggableStep) => void
}) => {
  const { query } = useRouter()
  const { setConnectingIds, connectingIds, openedStepId, setOpenedStepId } =
    useGraph()
  const { updateStep } = useTypebot()
  const [localStep, setLocalStep] = useState(step)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isPopoverOpened, setIsPopoverOpened] = useState(
    openedStepId === step.id
  )
  const [isEditing, setIsEditing] = useState<boolean>(
    isTextBubbleStep(step) && step.content.plainText === ''
  )
  const stepRef = useRef<HTMLDivElement | null>(null)

  const onDrag = (position: NodePosition) => {
    if (step.type === 'start' || !onMouseDown) return
    onMouseDown(position, step)
  }
  useDragDistance({
    ref: stepRef,
    onDrag,
    isDisabled: !onMouseDown || step.type === 'start',
  })

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
    updateStep(indices, { ...localStep })
    onModalClose()
  }

  const handleMouseEnter = () => {
    if (connectingIds)
      setConnectingIds({
        ...connectingIds,
        target: { blockId: step.blockId, stepId: step.id },
      })
  }

  const handleMouseLeave = () => {
    if (connectingIds?.target)
      setConnectingIds({
        ...connectingIds,
        target: { ...connectingIds.target, stepId: undefined },
      })
  }

  const handleCloseEditor = (content: TextBubbleContent) => {
    const updatedStep = { ...localStep, content } as Step
    setLocalStep(updatedStep)
    updateStep(indices, updatedStep)
    setIsEditing(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isTextBubbleStep(step)) setIsEditing(true)
    setOpenedStepId(step.id)
  }

  const handleExpandClick = () => {
    setOpenedStepId(undefined)
    onModalOpen()
  }

  const updateOptions = () => {
    updateStep(indices, { ...localStep })
  }

  const handleStepChange = (updates: Partial<Step>) => {
    setLocalStep({ ...localStep, ...updates } as Step)
  }

  const handleContentChange = (content: BubbleStepContent) =>
    setLocalStep({ ...localStep, content } as Step)

  useEffect(() => {
    if (isPopoverOpened && openedStepId !== step.id) updateOptions()
    setIsPopoverOpened(openedStepId === step.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedStepId])

  return isEditing && isTextBubbleStep(localStep) ? (
    <TextBubbleEditor
      initialValue={localStep.content.richText}
      onClose={handleCloseEditor}
    />
  ) : (
    <ContextMenu<HTMLDivElement>
      renderMenu={() => <StepNodeContextMenu indices={indices} />}
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
              ref={setMultipleRefs([ref, stepRef])}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              data-testid={`step`}
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
                <StepNodeContent step={localStep} indices={indices} />
                <TargetEndpoint
                  pos="absolute"
                  left="-32px"
                  top="19px"
                  stepId={localStep.id}
                />
                {isConnectable && hasDefaultConnector(localStep) && (
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
              onExpandClick={handleExpandClick}
              onStepChange={handleStepChange}
              onTestRequestClick={updateOptions}
              indices={indices}
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
              onStepChange={handleStepChange}
              onTestRequestClick={updateOptions}
              indices={indices}
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
