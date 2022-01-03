import {
  Editable,
  EditableInput,
  EditablePreview,
  Stack,
  useEventListener,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { Block } from 'bot-engine'
import { useAnalyticsGraph } from 'contexts/AnalyticsGraphProvider'
import { StepsList } from './StepsList'

type Props = {
  block: Block
}

export const BlockNode = ({ block }: Props) => {
  const { updateBlockPosition } = useAnalyticsGraph()
  const [isMouseDown, setIsMouseDown] = useState(false)

  const handleMouseDown = () => {
    setIsMouseDown(true)
  }
  const handleMouseUp = () => {
    setIsMouseDown(false)
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isMouseDown) return
    const { movementX, movementY } = event

    updateBlockPosition(block.id, {
      x: block.graphCoordinates.x + movementX,
      y: block.graphCoordinates.y + movementY,
    })
  }

  useEventListener('mousemove', handleMouseMove)

  return (
    <Stack
      p="4"
      rounded="lg"
      bgColor="blue.50"
      borderWidth="2px"
      minW="300px"
      transition="border 300ms"
      pos="absolute"
      style={{
        transform: `translate(${block.graphCoordinates.x}px, ${block.graphCoordinates.y}px)`,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <Editable defaultValue={block.title}>
        <EditablePreview px="1" userSelect={'none'} />
        <EditableInput minW="0" px="1" />
      </Editable>
      <StepsList blockId={block.id} steps={block.steps} />
    </Stack>
  )
}
