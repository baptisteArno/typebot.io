import {
  Editable,
  EditableInput,
  EditablePreview,
  Stack,
  useEventListener,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { StartBlock } from 'bot-engine'
import { useGraph } from 'contexts/GraphContext'
import { StepNode } from './StepNode'

export const StartBlockNode = ({ block }: { block: StartBlock }) => {
  const { setStartBlock } = useGraph()
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [titleValue, setTitleValue] = useState(block.title)

  const handleTitleChange = (title: string) => setTitleValue(title)

  const handleMouseDown = () => {
    setIsMouseDown(true)
  }
  const handleMouseUp = () => {
    setIsMouseDown(false)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isMouseDown) return
    const { movementX, movementY } = event

    setStartBlock({
      ...block,
      graphCoordinates: {
        x: block.graphCoordinates.x + movementX,
        y: block.graphCoordinates.y + movementY,
      },
    })
  }

  useEventListener('mousemove', handleMouseMove)

  return (
    <Stack
      p="4"
      rounded="lg"
      bgColor="blue.50"
      borderWidth="2px"
      borderColor="gray.400"
      minW="300px"
      transition="border 300ms"
      pos="absolute"
      style={{
        transform: `translate(${block.graphCoordinates.x}px, ${block.graphCoordinates.y}px)`,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      spacing="14px"
    >
      <Editable value={titleValue} onChange={handleTitleChange}>
        <EditablePreview _hover={{ bgColor: 'blue.100' }} px="1" />
        <EditableInput minW="0" px="1" />
      </Editable>
      <StepNode step={block.steps[0]} isConnectable={true} />
    </Stack>
  )
}
