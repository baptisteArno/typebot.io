import {
  useEventListener,
  Stack,
  Flex,
  Portal,
  Text,
  Center,
  HStack,
} from '@chakra-ui/react'
import {
  DraggableStep,
  DraggableStepType,
  InputStepType,
  IntegrationStepType,
  OctaBubbleStepType,
  OctaStepType,
  OctaWabaStepType,
  Step,
  StepType,
  WOZStepType,
} from 'models'
import {
  computeNearestPlaceholderIndex,
  useStepDnd,
} from 'contexts/GraphDndContext'
import { Coordinates, useGraph } from 'contexts/GraphContext'
import { useEffect, useRef, useState } from 'react'
import { useTypebot } from 'contexts/TypebotContext'
import { StepNode } from './StepNode/StepNode'
import { StepNodeOverlay } from './StepNodeOverlay'
import { PlusIcon } from 'assets/icons'

type Props = {
  blockId: string
  steps: Step[]
  blockIndex: number
  blockRef: React.MutableRefObject<HTMLDivElement | null>
  isStartBlock: boolean
}
export const StepNodesList = ({
  blockId,
  steps,
  blockIndex,
  blockRef,
  isStartBlock,
}: Props) => {
  const {
    draggedStep,
    setDraggedStep,
    draggedStepType,
    mouseOverBlock,
    setDraggedStepType,
  } = useStepDnd()
  const { typebot, createStep, detachStepFromBlock } = useTypebot()
  const { isReadOnly, graphPosition } = useGraph()
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
  const isDraggingOnCurrentBlock =
    (draggedStep || draggedStepType) && mouseOverBlock?.id === blockId
  const showSortPlaceholders = !isStartBlock && (draggedStep || draggedStepType)

  useEffect(() => {
    if (mouseOverBlock?.id !== blockId) setExpandedPlaceholderIndex(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseOverBlock?.id])

  const handleMouseMoveGlobal = (event: MouseEvent) => {
    if (!draggedStep || draggedStep.blockId !== blockId) return
    const { clientX, clientY } = event
    setPosition({
      x: clientX - mousePositionInElement.x,
      y: clientY - mousePositionInElement.y,
    })
  }

  const handleMouseMoveOnBlock = (event: MouseEvent) => {
    if (!isDraggingOnCurrentBlock) return
    setExpandedPlaceholderIndex(
      computeNearestPlaceholderIndex(event.pageY, placeholderRefs)
    )
  }

  const handleMouseUpOnBlock = (e: MouseEvent) => {
    setExpandedPlaceholderIndex(undefined)
    if (!isDraggingOnCurrentBlock) return
    const stepIndex = computeNearestPlaceholderIndex(e.clientY, placeholderRefs)
    createStep(
      blockId,
      (draggedStep || draggedStepType) as DraggableStep | DraggableStepType,
      {
        blockIndex,
        stepIndex,
      }
    )
    setDraggedStep(undefined)
    setDraggedStepType(undefined)
  }

  const isFinalStep = (type: StepType) =>
    [
      OctaBubbleStepType.END_CONVERSATION,
      OctaStepType.ASSIGN_TO_TEAM,
      OctaStepType.CALL_OTHER_BOT,
    ].includes(type)

  const [blockEndedIndex, setHasBlockEndedIndex] = useState<number>(-1)
  useEffect(() => {
    const endedIndex = steps.findIndex(
      (s) =>
        isFinalStep(s.type) ||
        s.type === InputStepType.CHOICE ||
        s.type === OctaStepType.OFFICE_HOURS ||
        s.type === WOZStepType.ASSIGN ||
        s.type === IntegrationStepType.WEBHOOK ||
        s.type === OctaWabaStepType.WHATSAPP_OPTIONS_LIST ||
        s.type === OctaWabaStepType.WHATSAPP_BUTTONS_LIST
    )
    setHasBlockEndedIndex(endedIndex)
  }, [steps])

  const handleStepMouseDown =
    (stepIndex: number) =>
    (
      { absolute, relative }: { absolute: Coordinates; relative: Coordinates },
      step: DraggableStep
    ) => {
      if (isReadOnly) return
      placeholderRefs.current.splice(stepIndex + 1, 1)
      detachStepFromBlock({ blockIndex, stepIndex })
      setPosition(absolute)
      setMousePositionInElement(relative)
      setDraggedStep(step)
    }

  const handlePushElementRef =
    (idx: number) => (elem: HTMLDivElement | null) => {
      elem && (placeholderRefs.current[idx] = elem)
    }

  useEventListener('mousemove', handleMouseMoveGlobal)
  useEventListener('mousemove', handleMouseMoveOnBlock, blockRef.current)
  useEventListener(
    'mouseup',
    handleMouseUpOnBlock,
    mouseOverBlock?.ref.current,
    {
      capture: true,
    }
  )
  return (
    <Stack
      spacing={1}
      transition="none"
      pointerEvents={isReadOnly || isStartBlock ? 'none' : 'auto'}
    >
      <Flex
        ref={handlePushElementRef(0)}
        h={
          showSortPlaceholders
            ? expandedPlaceholderIndex === 0
              ? '50px'
              : '30px'
            : '2px'
        }
        bgColor={'gray.300'}
        visibility={showSortPlaceholders ? 'visible' : 'hidden'}
        rounded="lg"
        transition={showSortPlaceholders ? 'height 200ms' : 'none'}
        alignItems={'center'}
      >
        <Center w={'100%'} h={'100%'}>
          <HStack color={'gray'} fontWeight={'semibold'}>
            <PlusIcon />
            <Text>Adicionar aqui</Text>
          </HStack>
        </Center>
      </Flex>
      {typebot &&
        steps.map((step, idx) => (
          <Stack key={step.id} spacing={1}>
            <StepNode
              key={step.id}
              step={step}
              indices={{ blockIndex, stepIndex: idx }}
              isConnectable={steps.length - 1 === idx}
              onMouseDown={handleStepMouseDown(idx)}
              isStartBlock={isStartBlock}
              unreachableNode={blockEndedIndex >= 0 && blockEndedIndex < idx}
            />
            {!isFinalStep(step.type) && (
              <Flex
                ref={handlePushElementRef(idx + 1)}
                h={
                  showSortPlaceholders
                    ? expandedPlaceholderIndex === idx + 1
                      ? '50px'
                      : '30px'
                    : '2px'
                }
                bgColor={'gray.300'}
                visibility={showSortPlaceholders ? 'visible' : 'hidden'}
                rounded="lg"
                transition={showSortPlaceholders ? 'height 200ms' : 'none'}
                alignItems={'center'}
              >
                <Center w={'100%'} h={'100%'}>
                  <HStack color={'gray'} fontWeight={'semibold'}>
                    <PlusIcon />
                    <Text>Adicionar aqui</Text>
                  </HStack>
                </Center>
              </Flex>
            )}
          </Stack>
        ))}
      {draggedStep && draggedStep.blockId === blockId && (
        <Portal>
          <StepNodeOverlay
            step={draggedStep}
            indices={{ blockIndex, stepIndex: 0 }}
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
