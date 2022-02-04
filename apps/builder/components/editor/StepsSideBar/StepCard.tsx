import { Flex, HStack, StackProps, Text } from '@chakra-ui/react'
import { StepType, DraggableStepType } from 'models'
import { useStepDnd } from 'contexts/GraphDndContext'
import React, { useEffect, useState } from 'react'
import { StepIcon } from './StepIcon'
import { StepTypeLabel } from './StepTypeLabel'

export const StepCard = ({
  type,
  onMouseDown,
}: {
  type: DraggableStepType
  onMouseDown: (e: React.MouseEvent, type: DraggableStepType) => void
}) => {
  const { draggedStepType } = useStepDnd()
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    setIsMouseDown(draggedStepType === type)
  }, [draggedStepType, type])

  const handleMouseDown = (e: React.MouseEvent) => onMouseDown(e, type)

  return (
    <Flex pos="relative">
      <HStack
        borderWidth="1px"
        rounded="lg"
        flex="1"
        cursor={'grab'}
        opacity={isMouseDown ? '0.4' : '1'}
        onMouseDown={handleMouseDown}
        bgColor="white"
        shadow="sm"
        px="4"
        py="2"
        _hover={{ shadow: 'md' }}
        transition="box-shadow 200ms"
      >
        {!isMouseDown ? (
          <>
            <StepIcon type={type} />
            <StepTypeLabel type={type} />
          </>
        ) : (
          <Text color="white" userSelect="none">
            Placeholder
          </Text>
        )}
      </HStack>
    </Flex>
  )
}

export const StepCardOverlay = ({
  type,
  ...props
}: StackProps & { type: StepType }) => {
  return (
    <HStack
      borderWidth="1px"
      rounded="lg"
      cursor={'grabbing'}
      w="147px"
      transition="none"
      pointerEvents="none"
      px="4"
      py="2"
      bgColor="white"
      shadow="xl"
      zIndex={2}
      {...props}
    >
      <StepIcon type={type} />
      <StepTypeLabel type={type} />
    </HStack>
  )
}
