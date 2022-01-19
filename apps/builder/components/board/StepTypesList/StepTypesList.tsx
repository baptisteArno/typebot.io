import {
  Stack,
  Input,
  Text,
  SimpleGrid,
  useEventListener,
  Portal,
} from '@chakra-ui/react'
import {
  BubbleStepType,
  DraggableStepType,
  InputStepType,
  IntegrationStepType,
  LogicStepType,
} from 'models'
import { useDnd } from 'contexts/DndContext'
import React, { useState } from 'react'
import { StepCard, StepCardOverlay } from './StepCard'

export const StepTypesList = () => {
  const { setDraggedStepType, draggedStepType } = useDnd()
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })

  const handleMouseMove = (event: MouseEvent) => {
    if (!draggedStepType) return
    const { clientX, clientY } = event
    setPosition({
      ...position,
      x: clientX - relativeCoordinates.x,
      y: clientY - relativeCoordinates.y,
    })
  }
  useEventListener('mousemove', handleMouseMove)

  const handleMouseDown = (e: React.MouseEvent, type: DraggableStepType) => {
    const element = e.currentTarget as HTMLDivElement
    const rect = element.getBoundingClientRect()
    setPosition({ x: rect.left, y: rect.top })
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setRelativeCoordinates({ x, y })
    console.log({ x: rect.left, y: rect.top })
    setDraggedStepType(type)
  }

  const handleMouseUp = () => {
    if (!draggedStepType) return
    setDraggedStepType(undefined)
    setPosition({
      x: 0,
      y: 0,
    })
  }
  useEventListener('mouseup', handleMouseUp)

  return (
    <Stack
      w="320px"
      pos="absolute"
      left="10px"
      top="10px"
      h="calc(100vh - 80px)"
      rounded="lg"
      shadow="xl"
      borderWidth="1px"
      zIndex="2"
      py="4"
      px="2"
      bgColor="gray.50"
      spacing={6}
      userSelect="none"
    >
      <Input placeholder="Search..." bgColor="white" />
      <Stack>
        <Text fontSize="sm" fontWeight="semibold" color="gray.600">
          Bubbles
        </Text>
        <SimpleGrid columns={2} spacing="2">
          {Object.values(BubbleStepType).map((type) => (
            <StepCard key={type} type={type} onMouseDown={handleMouseDown} />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack>
        <Text fontSize="sm" fontWeight="semibold" color="gray.600">
          Inputs
        </Text>
        <SimpleGrid columns={2} spacing="2">
          {Object.values(InputStepType).map((type) => (
            <StepCard key={type} type={type} onMouseDown={handleMouseDown} />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack>
        <Text fontSize="sm" fontWeight="semibold" color="gray.600">
          Logic
        </Text>
        <SimpleGrid columns={2} spacing="2">
          {Object.values(LogicStepType).map((type) => (
            <StepCard key={type} type={type} onMouseDown={handleMouseDown} />
          ))}
        </SimpleGrid>
      </Stack>

      <Stack>
        <Text fontSize="sm" fontWeight="semibold" color="gray.600">
          Integrations
        </Text>
        <SimpleGrid columns={2} spacing="2">
          {Object.values(IntegrationStepType).map((type) => (
            <StepCard key={type} type={type} onMouseDown={handleMouseDown} />
          ))}
        </SimpleGrid>
      </Stack>

      {draggedStepType && (
        <Portal>
          <StepCardOverlay
            type={draggedStepType}
            onMouseUp={handleMouseUp}
            pos="fixed"
            top="0"
            left="0"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg)`,
            }}
          />
        </Portal>
      )}
    </Stack>
  )
}
