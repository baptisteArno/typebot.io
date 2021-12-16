import { Box, Flex, HStack, StackProps, Text } from '@chakra-ui/react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Block, StartStep, Step, StepType } from 'bot-engine'
import { SourceEndpoint } from './SourceEndpoint'
import { useGraph } from 'contexts/GraphContext'
import { StepIcon } from 'components/board/StepTypesList/StepIcon'
import { isDefined } from 'services/utils'

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
  onMouseDown?: (e: React.MouseEvent, step: Step) => void
}) => {
  const stepRef = useRef<HTMLDivElement | null>(null)
  const {
    setConnectingIds,
    removeStepFromBlock,
    blocks,
    connectingIds,
    startBlock,
  } = useGraph()
  const [isConnecting, setIsConnecting] = useState(false)

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
    onMouseDown(e, step as Step)
    removeStepFromBlock(step.blockId, step.id)
  }

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onMouseMoveBottomOfElement || !onMouseMoveTopOfElement) return
    const element = event.currentTarget as HTMLDivElement
    const rect = element.getBoundingClientRect()
    const y = event.clientY - rect.top
    if (y > rect.height / 2) onMouseMoveBottomOfElement()
    else onMouseMoveTopOfElement()
  }

  const connectedStubPosition: 'right' | 'left' | undefined = useMemo(() => {
    const currentBlock = [startBlock, ...blocks].find(
      (b) => b?.id === step.blockId
    )
    const isDragginConnectorFromCurrentBlock =
      connectingIds?.blockId === currentBlock?.id &&
      connectingIds?.target?.blockId
    const targetBlockId = isDragginConnectorFromCurrentBlock
      ? connectingIds.target?.blockId
      : step.target?.blockId
    const targetedBlock = targetBlockId
      ? blocks.find((b) => b.id === targetBlockId)
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

  return (
    <Flex
      pos="relative"
      ref={stepRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        borderColor={isConnecting ? 'blue.400' : 'gray.400'}
        rounded="lg"
        cursor={'grab'}
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
  )
}

export const StepContent = (props: Step | StartStep) => {
  switch (props.type) {
    case StepType.TEXT: {
      return (
        <Text opacity={props.content === '' ? '0.5' : '1'}>
          {props.content === '' ? 'Type text...' : props.content}
        </Text>
      )
    }
    case StepType.DATE_PICKER: {
      return (
        <Text opacity={props.content === '' ? '0.5' : '1'}>
          {props.content === '' ? 'Pick a date...' : props.content}
        </Text>
      )
    }
    case StepType.START: {
      return <Text>{props.label}</Text>
    }
    default: {
      return <Text>No input</Text>
    }
  }
}

export const StepNodeOverlay = ({
  step,
  ...props
}: { step: Step } & StackProps) => {
  return (
    <HStack
      p="3"
      borderWidth="1px"
      rounded="lg"
      bgColor="white"
      cursor={'grab'}
      pos="fixed"
      top="0"
      left="0"
      w="264px"
      pointerEvents="none"
      {...props}
    >
      <StepIcon type={step.type} />
      <StepContent {...step} />
    </HStack>
  )
}
