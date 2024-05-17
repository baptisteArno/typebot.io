import {
  Flex,
  HStack,
  Stack,
  Popover,
  PopoverTrigger,
  useDisclosure,
  Text,
  Spacer,
} from '@chakra-ui/react'
import React, { createContext, useEffect, useRef, useState } from 'react'
import {
  BubbleStep,
  DraggableStep,
  Step,
  TextBubbleContent,
  TextBubbleStep,
  AssignToTeamStep,
  CallOtherBotStep,
  OfficeHourStep,
  OctaStepType,
  WebhookStep,
  IntegrationStepType,
  WhatsAppOptionsListStep,
  WhatsAppButtonsListStep,
  OctaWabaStepType,
  WOZAssignStep,
  WOZStepType,
} from 'models'
import { useGraph } from 'contexts/GraphContext'
import { StepIcon } from 'components/editor/StepsSideBar/StepIcon'
import { isTextBubbleStep, isOctaBubbleStep } from 'utils'
import { StepNodeContent } from '../StepNodeContent/StepNodeContent/StepNodeContent'
import { useTypebot } from 'contexts/TypebotContext'
import { ContextMenu } from 'components/shared/ContextMenu'
import { StepNodeContextMenu } from '../StepNodeContextMenu'
import { SourceEndpoint } from '../../../Endpoints/SourceEndpoint'
import { hasDefaultConnector } from 'services/typebots'
import { useRouter } from 'next/router'
import { SettingsModal } from '../SettingsPopoverContent/SettingsModal'
import { StepSettings } from '../SettingsPopoverContent/SettingsPopoverContent'
import { TextBubbleEditor } from '../TextBubbleEditor'
import { TargetEndpoint } from '../../../Endpoints'
import { NodePosition, useDragDistance } from 'contexts/GraphDndContext'
import { setMultipleRefs } from 'services/utils'
import { BlockStack } from './StepNode.style'
import { StepTypeLabel } from 'components/editor/StepsSideBar/StepTypeLabel'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'
import { WarningIcon, ErrorIcon } from 'assets/icons'
import OctaTooltip from 'components/octaComponents/OctaTooltip/OctaTooltip'
import {
  VALIDATION_MESSAGE_TYPE,
  ValidationMessage,
  getValidationMessages,
} from '../../helpers/helpers'
import { ActionsTypeEmptyFields } from 'services/utils/useEmptyFields'
import { colors } from 'libs/theme'

type StepNodeContextProps = {
  setIsPopoverOpened?: (isPopoverOpened: boolean) => void
}

export const StepNodeContext = createContext<StepNodeContextProps>({})

export const StepNode = ({
  step,
  isConnectable,
  indices,
  onMouseDown,
  isStartBlock,
  unreachableNode,
}: {
  step: Step
  isConnectable: boolean
  indices: { stepIndex: number; blockIndex: number }
  onMouseDown?: (stepNodePosition: NodePosition, step: DraggableStep) => void
  isStartBlock: boolean
  unreachableNode?: boolean
}) => {
  const { query } = useRouter()
  const {
    connectingIds,
    openedStepId,
    setOpenedStepId,
    setFocusedBlockId,
    previewingEdge,
  } = useGraph()
  const { updateStep, emptyFields, setEmptyFields, typebot } = useTypebot()
  const [isConnecting, setIsConnecting] = useState(false)

  const availableOnlyForEvent =
    typebot?.availableFor?.length == 1 && typebot.availableFor.includes('event')

  const showWarning = !availableOnlyForEvent

  const [isPopoverOpened, setIsPopoverOpened] = useState(
    openedStepId === step.id
  )
  const [isEditing, setIsEditing] = useState<boolean>(
    (isTextBubbleStep(step) || isOctaBubbleStep(step)) &&
      step.content.plainText === ''
  )
  const stepRef = useRef<HTMLDivElement | null>(null)

  const isPreviewing = isConnecting || previewingEdge?.to.stepId === step.id

  const onDrag = (position: NodePosition) => {
    if (step.type === 'start' || !onMouseDown) return
    onMouseDown(position, step)
  }
  useDragDistance({
    ref: stepRef,
    onDrag,
    isDisabled: !onMouseDown || step.type === 'start',
  })

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const [validationMessages, setValidationMessages] =
    useState<Array<ValidationMessage>>()

  useEffect(() => {
    const currentMessages = getValidationMessages(step)
    setValidationMessages(currentMessages)
    if (currentMessages.length > 0) {
      if (!emptyFields.find((field) => field?.step.id === step?.id)) {
        setEmptyFields(
          [{ step, errorMessage: currentMessages[0].message }],
          ActionsTypeEmptyFields.ADD
        )
      }
    } else {
      const checking = emptyFields.some((field) => field?.step.id === step?.id)
      if (checking) {
        setEmptyFields([step?.id], ActionsTypeEmptyFields.REMOVE)
      }
    }
  }, [step])

  const { onClose: onModalClose } = useDisclosure({
    defaultIsOpen: true,
  })

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
    updateStep(indices, { ...step })
    onModalClose()
    setIsModalOpen(false)
    setIsEditing(false)
    setIsPopoverOpened(false)
  }

  const handleKeyUp = (content: TextBubbleContent) => {
    const updatedStep = { ...step, content } as Step
    updateStep(indices, updatedStep)
  }

  const handleCloseEditor = () => {
    setIsEditing(false)
    setIsModalOpen(false)
    setIsPopoverOpened(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    setFocusedBlockId(step.blockId)
    e.stopPropagation()
    if (isTextBubbleStep(step) || isOctaBubbleStep(step)) setIsEditing(true)
    else setIsModalOpen(true)

    setOpenedStepId(step.id)
  }

  const handleStepUpdate = (updates: Partial<Step>): void => {
    updateStep(indices, { ...step, ...updates })
  }

  const hasErrorMessage = () => {
    return validationMessages?.some(
      (s) => s.type === VALIDATION_MESSAGE_TYPE.WARNING
    )
  }

  useEffect(() => {
    setIsPopoverOpened(openedStepId === step.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedStepId])

  const checkisConnectable = (step: Step): boolean => {
    return (
      !isEndConversationStep(step) &&
      !isAssignToTeamStep(step) &&
      hasDefaultConnector(step) &&
      !isOfficeHoursStep(step) &&
      !isWebhookStep(step) &&
      !isCallOtherBotStep(step) &&
      !isWhatsAppOptionsListStep(step) &&
      !isWhatsAppButtonsListStep(step) &&
      !isWozAssignStep(step)
    )
  }

  return isEditing && (isTextBubbleStep(step) || isOctaBubbleStep(step)) ? (
    <TextBubbleEditor
      initialValue={step.content.richText}
      onClose={handleCloseEditor}
      onKeyUp={handleKeyUp}
    />
  ) : (
    <StepNodeContext.Provider value={{ setIsPopoverOpened }}>
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
                onClick={handleClick}
                data-testid={`step`}
                w="full"
                direction="column"
              >
                <Stack spacing={2}>
                  <BlockStack
                    isOpened={isOpened}
                    isPreviewing={isPreviewing}
                    style={{
                      border: 'solid 2px',
                      borderColor: hasErrorMessage() ? colors.red[400] : '',
                    }}
                  >
                    <Stack spacing={2} w="full">
                      <HStack fontSize={'14px'}>
                        <StepIcon
                          type={step.type}
                          mt="1"
                          data-testid={`${step.id}-icon`}
                        />
                        <StepTypeLabel
                          type={step.type}
                          data-testid={`${step.id}-icon`}
                        />
                        <Spacer />
                        {unreachableNode && showWarning && (
                          <>
                            <OctaTooltip
                              element={<WarningIcon color={'#FAC300'} />}
                              contentText={
                                'Atenção! Essa ação não será executada pois o bot já encerrou ou foi direcionado anteriormente'
                              }
                              tooltipPlacement={'auto'}
                              popoverColor="#FFE894"
                              textColor="#574B24"
                              duration={3000}
                            />
                          </>
                        )}
                        {!unreachableNode &&
                          showWarning &&
                          validationMessages?.map((s, index) => {
                            return (
                              <OctaTooltip
                                key={index}
                                element={
                                  <ErrorIcon
                                    size={20}
                                    color={colors.red[400]}
                                  />
                                }
                                contentText={s.message.join(' | ')}
                                tooltipPlacement={'auto'}
                                popoverColor={
                                  s.type === VALIDATION_MESSAGE_TYPE.ERROR
                                    ? '#FBD9D0'
                                    : '#FFE894'
                                }
                                textColor={
                                  s.type === VALIDATION_MESSAGE_TYPE.ERROR
                                    ? '#5B332E'
                                    : '#574B24'
                                }
                                duration={3000}
                              />
                            )
                          })}
                      </HStack>
                      {step.type !== 'start' && (
                        <span>
                          <OctaDivider />
                          <StepNodeContent step={step} indices={indices} />
                        </span>
                      )}
                      <TargetEndpoint
                        pos="absolute"
                        left="-32px"
                        top="19px"
                        stepId={step.id}
                      />
                      {isConnectable && checkisConnectable(step) && (
                        <SourceEndpoint
                          source={{
                            blockId: step.blockId,
                            stepId: step.id,
                          }}
                          pos="absolute"
                          right="-34px"
                          bottom="10px"
                        />
                      )}
                    </Stack>
                  </BlockStack>

                  {step.type === 'assign to team' &&
                    hasStepRedirectCheckAvailability(step) && (
                      <HStack
                        flex="1"
                        userSelect="none"
                        p="2"
                        borderWidth={isOpened || isPreviewing ? '2px' : '1px'}
                        borderColor={
                          isOpened || isPreviewing ? 'blue.400' : 'gray.200'
                        }
                        margin={isOpened || isPreviewing ? '-1px' : 0}
                        rounded="lg"
                        cursor={'pointer'}
                        bgColor="gray.50"
                        align="flex-start"
                        w="full"
                        transition="border-color 0.2s"
                      >
                        <Flex
                          px="2"
                          py="2"
                          borderWidth="1px"
                          borderColor="gray.300"
                          bgColor={'gray.50'}
                          rounded="md"
                          pos="relative"
                          align="center"
                          cursor={'pointer'}
                        >
                          <Text color={'gray.500'}>
                            Sem agentes disponíveis
                          </Text>
                        </Flex>
                        <TargetEndpoint
                          pos="absolute"
                          left="-32px"
                          top="19px"
                          stepId={step.id}
                        />
                        {
                          <SourceEndpoint
                            source={{
                              blockId: step.blockId,
                              stepId: step.id,
                            }}
                            pos="absolute"
                            right="-34px"
                            bottom="10px"
                          />
                        }
                      </HStack>
                    )}
                </Stack>
              </Flex>
            </PopoverTrigger>
            <SettingsModal
              id="settings-modal"
              isOpen={isModalOpen}
              onClose={handleModalClose}
              stepType={step.type}
            >
              <StepSettings step={step} onStepChange={handleStepUpdate} />
            </SettingsModal>
          </Popover>
        )}
      </ContextMenu>
    </StepNodeContext.Provider>
  )
}

const isEndConversationStep = (
  step: Step
): step is Exclude<Step, BubbleStep> => {
  // hasStepRedirectNoneAvailable(step)
  return isOctaBubbleStep(step)
}

const isAssignToTeamStep = (step: Step): step is AssignToTeamStep => {
  return step.type === OctaStepType.ASSIGN_TO_TEAM
}

const isWozAssignStep = (step: Step): step is WOZAssignStep => {
  return step.type === WOZStepType.ASSIGN
}

const isCallOtherBotStep = (step: Step): step is CallOtherBotStep => {
  return step.type === OctaStepType.CALL_OTHER_BOT
}

const isOfficeHoursStep = (step: Step): step is OfficeHourStep => {
  return step.type === OctaStepType.OFFICE_HOURS
}

const isWebhookStep = (step: Step): step is WebhookStep => {
  return step.type === IntegrationStepType.WEBHOOK
}

const isWhatsAppOptionsListStep = (
  step: Step
): step is WhatsAppOptionsListStep => {
  return step.type === OctaWabaStepType.WHATSAPP_OPTIONS_LIST
}

const isWhatsAppButtonsListStep = (
  step: Step
): step is WhatsAppButtonsListStep => {
  return step.type === OctaWabaStepType.WHATSAPP_BUTTONS_LIST
}

const hasStepRedirectCheckAvailability = (
  step: Step
): step is AssignToTeamStep => {
  if (step.type === 'assign to team') {
    return step.options.isAvailable
  }

  return true
}
