import {
  Stack,
  Input,
  Text,
  SimpleGrid,
  useEventListener,
} from '@chakra-ui/react'
import { StepType } from 'bot-engine'
import { useDnd } from 'contexts/DndContext'
import React, { useState } from 'react'
import { StepCard, StepCardOverlay } from './StepCard'

export const stepListItems: {
  bubbles: { type: StepType }[]
  inputs: { type: StepType }[]
} = {
  bubbles: [{ type: StepType.TEXT }],
  inputs: [{ type: StepType.TEXT_INPUT }],
}

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

  const handleMouseDown = (e: React.MouseEvent, type: StepType) => {
    const element = e.currentTarget as HTMLDivElement
    const rect = element.getBoundingClientRect()
    const relativeX = e.clientX - rect.left
    const relativeY = e.clientY - rect.top
    setPosition({ x: e.clientX - relativeX, y: e.clientY - relativeY })
    setRelativeCoordinates({ x: relativeX, y: relativeY })
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
      top="20px"
      h="calc(100vh - 100px)"
      rounded="lg"
      shadow="lg"
      borderWidth="1px"
      zIndex="10"
      py="4"
      px="2"
      bgColor="white"
    >
      <Input placeholder="Search..." />
      <Text fontSize="sm" fontWeight="semibold" color="gray.600">
        Bubbles
      </Text>
      <SimpleGrid columns={2} spacing="2">
        {stepListItems.bubbles.map((props) => (
          <StepCard key={props.type} onMouseDown={handleMouseDown} {...props} />
        ))}
      </SimpleGrid>

      <Text fontSize="sm" fontWeight="semibold" color="gray.600">
        Inputs
      </Text>
      <SimpleGrid columns={2} spacing="2">
        {stepListItems.inputs.map((props) => (
          <StepCard key={props.type} onMouseDown={handleMouseDown} {...props} />
        ))}
      </SimpleGrid>
      {draggedStepType && (
        <StepCardOverlay
          type={draggedStepType}
          onMouseUp={handleMouseUp}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) rotate(-2deg)`,
          }}
        />
      )}
    </Stack>
  )
}
