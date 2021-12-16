import { Button, ButtonProps, Flex, HStack } from '@chakra-ui/react'
import { StepType } from 'bot-engine'
import { useDnd } from 'contexts/DndContext'
import React, { useEffect, useState } from 'react'
import { StepIcon } from './StepIcon'
import { StepLabel } from './StepLabel'

export const StepCard = ({
  type,
  onMouseDown,
}: {
  type: StepType
  onMouseDown: (e: React.MouseEvent, type: StepType) => void
}) => {
  const { draggedStepType } = useDnd()
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    setIsMouseDown(draggedStepType === type)
  }, [draggedStepType, type])

  const handleMouseDown = (e: React.MouseEvent) => onMouseDown(e, type)

  return (
    <Flex pos="relative">
      <Button
        as={HStack}
        borderWidth="1px"
        rounded="lg"
        flex="1"
        cursor={'grab'}
        colorScheme="gray"
        opacity={isMouseDown ? '0.4' : '1'}
        onMouseDown={handleMouseDown}
      >
        {!isMouseDown && (
          <>
            <StepIcon type={type} />
            <StepLabel type={type} />
          </>
        )}
      </Button>
    </Flex>
  )
}

export const StepCardOverlay = ({
  type,
  ...props
}: Omit<ButtonProps, 'type'> & { type: StepType }) => {
  return (
    <Button
      as={HStack}
      borderWidth="1px"
      rounded="lg"
      cursor={'grab'}
      colorScheme="gray"
      w="147px"
      pos="fixed"
      top="0"
      left="0"
      transition="none"
      pointerEvents="none"
      {...props}
    >
      <StepIcon type={type} />
      <StepLabel type={type} />
    </Button>
  )
}
