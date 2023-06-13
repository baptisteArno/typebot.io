import { Flex, Portal, Stack, Text, useEventListener } from '@chakra-ui/react'
import {
  computeNearestPlaceholderIndex,
  useStepDnd,
} from 'contexts/GraphDndContext'
import { Coordinates, useGraph } from 'contexts/GraphContext'
import { useTypebot } from 'contexts/TypebotContext'
import { ButtonItem, IntegrationStepType, OctaStepType, OctaWabaStepType, StepIndices, StepWithItems, WebhookStep } from 'models'
import React, { useEffect, useRef, useState } from 'react'
import { ItemNode } from '../ItemNode'
import { SourceEndpoint } from '../../../Endpoints'
import { ItemNodeOverlay } from '../ItemNodeOverlay'
import { Container, HandleSelectCalendar, SelectedCalendar } from './ItemNodeList.style'

type Props = {
  step: StepWithItems
  indices: StepIndices
  isReadOnly?: boolean
}

export const ItemNodesList = ({
  step,
  indices: { blockIndex, stepIndex },
  isReadOnly = false
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

  const webhook = typebot?.blocks[blockIndex].steps[stepIndex].options?.url
  return (
    <Stack
      flex={1}
      spacing={1}
      maxW="full"
      onClick={stopPropagating}
      pointerEvents={isReadOnly ? 'none' : 'all'}
    >
      {/* <Flex
        ref={handlePushElementRef(0)}
        h={showPlaceholders && expandedPlaceholderIndex === 0 ? '50px' : '2px'}
        bgColor={'gray.300'}
        visibility={showPlaceholders ? 'visible' : 'hidden'}
        rounded="lg"
        transition={showPlaceholders ? 'height 200ms' : 'none'}
      /> */}
      {step.type === OctaStepType.OFFICE_HOURS && (
        <Container>
          {!typebot?.blocks[blockIndex].steps[stepIndex].options['name'] && <HandleSelectCalendar>
            Selecione o expediente que o seu bot irá seguir
          </HandleSelectCalendar>}
          {typebot?.blocks[blockIndex].steps[stepIndex].options['name'] &&
            <div>
              Horário: &nbsp;&nbsp;
              <SelectedCalendar>
                {typebot?.blocks[blockIndex].steps[stepIndex].options['name']}
              </SelectedCalendar>
            </div>
          }
        </Container>
      )}
      {step.type === IntegrationStepType.WEBHOOK && (
        <Container>
          {!webhook &&
          <Text color={'gray.500'} noOfLines={0}>
            {'Conecte a outro sistema'}
          </Text>
          }
          {webhook &&
            <Text color={'gray.500'} noOfLines={0}>
              {typebot?.blocks[blockIndex].steps[stepIndex].options?.method} <br/>
              {webhook}
            </Text>
          }
        </Container>
      )}
      {step.type === OctaWabaStepType.WHATSAPP_OPTIONS_LIST && (
        <Container>
          {
            <Stack>
              <Text color={'gray.500'} noOfLines={0}>
                {step.options?.header && (
                  <strong>{step.options.header.plainText}</strong>
                )}
              </Text>
              <Text color={'gray.500'} noOfLines={0}>
                {step.options?.body && (
                  <label>{step.options.body.plainText}</label>
                )}
              </Text>
              <Text color={'gray.500'} fontSize='xs' noOfLines={0}>
                {step.options?.footer && (
                  <label>{step.options.footer.plainText}</label>
                )}
              </Text>
            </Stack>
            
          }
        </Container>
      )}
      {step && step.items && step.items.map((item, idx) => {
        return (
          <Stack key={item.id} spacing={1}>
            <ItemNode
              item={item}
              step={step}
              indices={{ blockIndex, stepIndex, itemIndex: idx }}
              onMouseDown={handleStepMouseDown(idx)}
              isReadOnly={isReadOnly}
            />
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
          </Stack>
        )
      })}
      {isLastStep && step.type !== OctaStepType.OFFICE_HOURS && step.type !== IntegrationStepType.WEBHOOK && step.type !== OctaWabaStepType.WHATSAPP_OPTIONS_LIST && (
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
          <Text color={isReadOnly ? 'inherit' : 'gray.500'}>Padrão  </Text>
          <SourceEndpoint
            source={{
              blockId: step.blockId,
              stepId: step.id,
            }}
            pos="absolute"
            right="-49px"
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
