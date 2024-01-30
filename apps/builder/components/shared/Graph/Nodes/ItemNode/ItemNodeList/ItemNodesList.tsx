import {
  Flex,
  Portal,
  Stack,
  Text,
  useEventListener,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from '@chakra-ui/react'
import {
  computeNearestPlaceholderIndex,
  useStepDnd,
} from 'contexts/GraphDndContext'
import { Coordinates, useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import {
  ButtonItem,
  InputStepType,
  IntegrationStepType,
  OctaStepType,
  OctaWabaStepType,
  StepIndices,
  StepWithItems,
  WOZStepType,
} from 'models'
import React, { useEffect, useRef, useState } from 'react'
import { ItemNode } from '../ItemNode'
import { SourceEndpoint } from '../../../Endpoints'
import { ItemNodeOverlay } from '../ItemNodeOverlay'
import {
  Container,
  HandleSelectCalendar,
  SelectedCalendar,
} from './ItemNodeList.style'
import { CodeEditor } from 'components/shared/CodeEditor'

type Props = {
  step: StepWithItems
  indices: StepIndices
  isReadOnly?: boolean
}

export const ItemNodesList = ({
  step,
  indices: { blockIndex, stepIndex },
  isReadOnly = false,
}: Props) => {
  const { typebot, createItem, detachItemFromStep } = useTypebot()
  const { draggedItem, setDraggedItem, mouseOverBlock } = useStepDnd()
  const placeholderRefs = useRef<HTMLDivElement[]>([])
  const { graphPosition } = useGraph()
  const blockId = typebot?.blocks[blockIndex].id
  const isDraggingOnCurrentBlock =
    (draggedItem && mouseOverBlock?.id === blockId) ?? false
  const showPlaceholders = draggedItem && !isReadOnly

  const isLastStep =
    typebot?.blocks[blockIndex].steps[stepIndex + 1] === undefined

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })
  const [expandedPlaceholderIndex, setExpandedPlaceholderIndex] = useState<
    number | undefined
  >()

  const handleGlobalMouseMove = (event: MouseEvent) => {
    if (!draggedItem || draggedItem.stepId !== step.id) return
    const { clientX, clientY } = event
    setPosition({
      ...position,
      x: clientX - relativeCoordinates.x,
      y: clientY - relativeCoordinates.y,
    })
  }
  useEventListener('mousemove', handleGlobalMouseMove)

  useEffect(() => {
    if (mouseOverBlock?.id !== step.blockId)
      setExpandedPlaceholderIndex(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseOverBlock?.id])

  const handleMouseMoveOnBlock = (event: MouseEvent) => {
    if (!isDraggingOnCurrentBlock || isReadOnly) return
    const index = computeNearestPlaceholderIndex(event.pageY, placeholderRefs)
    setExpandedPlaceholderIndex(index)
  }
  useEventListener(
    'mousemove',
    handleMouseMoveOnBlock,
    mouseOverBlock?.ref.current
  )

  const handleMouseUpOnBlock = (e: MouseEvent) => {
    setExpandedPlaceholderIndex(undefined)
    if (!isDraggingOnCurrentBlock) return
    const itemIndex = computeNearestPlaceholderIndex(e.pageY, placeholderRefs)
    e.stopPropagation()
    setDraggedItem(undefined)
    createItem(draggedItem as ButtonItem, {
      blockIndex,
      stepIndex,
      itemIndex,
    })
  }
  useEventListener(
    'mouseup',
    handleMouseUpOnBlock,
    mouseOverBlock?.ref.current,
    {
      capture: true,
    }
  )

  const handleStepMouseDown =
    (itemIndex: number) =>
    (
      { absolute, relative }: { absolute: Coordinates; relative: Coordinates },
      item: ButtonItem
    ) => {
      if (!typebot || isReadOnly) return
      placeholderRefs.current.splice(itemIndex + 1, 1)
      detachItemFromStep({ blockIndex, stepIndex, itemIndex })
      setPosition(absolute)
      setRelativeCoordinates(relative)
      setDraggedItem(item)
    }

  const stopPropagating = (e: React.MouseEvent) => e.stopPropagation()

  const handlePushElementRef =
    (idx: number) => (elem: HTMLDivElement | null) => {
      elem && (placeholderRefs.current[idx] = elem)
    }

  const webhook = {
    method: typebot?.blocks[blockIndex]?.steps[stepIndex]?.options?.method,
    url: typebot?.blocks[blockIndex]?.steps[stepIndex]?.options?.url,
    path: typebot?.blocks[blockIndex]?.steps[stepIndex]?.options?.path,
  }

  const getWebhookDetails = () => {
    try {
      const headers = {}

      typebot?.blocks[blockIndex]?.steps[stepIndex]?.options?.headers.map(
        (header) => {
          headers[header.key] = header.value
        }
      )

      const jsonPreview = {
        headers,
        body: JSON.parse(
          typebot?.blocks[blockIndex]?.steps[stepIndex]?.options?.body
        ),
      }

      return JSON.stringify(jsonPreview ?? '{}', undefined, 2)
    } catch {
      return 'Is not valid JSON'
    }
  }

  return (
    <Stack
      flex={1}
      spacing={1}
      maxW="full"
      onClick={stopPropagating}
      pointerEvents={isReadOnly ? 'none' : 'all'}
    >
      {step.type === OctaStepType.OFFICE_HOURS && (
        <Stack paddingBottom={'10px'}>
          {!typebot?.blocks[blockIndex].steps[stepIndex]?.options?.name && (
            <HandleSelectCalendar>Selecione o expediente:</HandleSelectCalendar>
          )}
          {typebot?.blocks[blockIndex].steps[stepIndex]?.options?.name && (
            <div>
              Horário: &nbsp;&nbsp;
              <SelectedCalendar>
                {typebot?.blocks[blockIndex].steps[stepIndex].options?.name}
              </SelectedCalendar>
            </div>
          )}
        </Stack>
      )}
      {step.type === IntegrationStepType.WEBHOOK && (
        <Container>
          {!webhook?.url && (
            <Text noOfLines={0}>{'Clique para editar...'}</Text>
          )}
          {webhook?.url && (
            <Text noOfLines={0}>
              {webhook.method} <br />
              {webhook.url + webhook.path}
            </Text>
          )}
          {webhook?.url && (
            <Accordion
              allowMultiple
              onClick={stopPropagating}
              pointerEvents="all"
            >
              <AccordionItem>
                <AccordionButton justifyContent="space-between">
                  <b>Detalhes</b>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <CodeEditor
                    value={getWebhookDetails() ?? '{}'}
                    defaultValue={'{}'}
                    lang="json"
                    withVariableButton={false}
                    isReadOnly
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}
        </Container>
      )}
      {step &&
        step.items &&
        step.items.map((item, idx) => {
          return (
            <Stack key={item.id} spacing={1}>
              <ItemNode
                item={item}
                step={step}
                indices={{ blockIndex, stepIndex, itemIndex: idx, itemsCount: step.items.length }}
                onMouseDown={handleStepMouseDown(idx)}
                isReadOnly={isReadOnly}
              />
              {step.type !== WOZStepType.ASSIGN && (
              <Flex
                ref={handlePushElementRef(idx + 1)}
                h={
                  showPlaceholders && expandedPlaceholderIndex === idx + 1
                    ? '50px'
                    : '2px'
                }
                bgColor={'gray.300'}
                visibility={showPlaceholders ? 'visible' : 'hidden'}
                rounded="lg"
                transition={showPlaceholders ? 'height 200ms' : 'none'}
              />
              )}
            </Stack>
          )
        })}
      {isLastStep &&
        step.type !== OctaStepType.OFFICE_HOURS &&
        step.type !== InputStepType.CHOICE &&
        step.type !== IntegrationStepType.WEBHOOK &&
        step.type !== OctaWabaStepType.WHATSAPP_OPTIONS_LIST &&
        step.type !== OctaWabaStepType.WHATSAPP_BUTTONS_LIST &&
        step.type !== WOZStepType.ASSIGN && (
          <Flex
            px="4"
            py="2"
            borderWidth="1px"
            borderColor="gray.300"
            bgColor={isReadOnly ? '' : 'gray.50'}
            rounded="md"
            pos="relative"
            align="center"
            cursor={isReadOnly ? 'pointer' : 'not-allowed'}
          >
            <Text color={isReadOnly ? 'inherit' : 'gray.500'}>
              Se a regra não for válida, ir para:
            </Text>
            <SourceEndpoint
              source={{
                blockId: step.blockId,
                stepId: step.id,
              }}
              pos="absolute"
              right="-44px"
            />
          </Flex>
        )}

      {draggedItem && draggedItem.stepId === step.id && (
        <Portal>
          <ItemNodeOverlay
            item={draggedItem}
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
