import { Flex, HStack, StackProps, Text, Tooltip } from '@chakra-ui/react'
import { BlockType, DraggableBlockType } from 'models'
import { useBlockDnd } from '@/features/graph'
import React, { useEffect, useState } from 'react'
import { BlockIcon } from './BlockIcon'
import { BlockTypeLabel } from './BlockTypeLabel'

export const BlockCard = ({
  type,
  onMouseDown,
  isDisabled = false,
}: {
  type: DraggableBlockType
  isDisabled?: boolean
  onMouseDown: (e: React.MouseEvent, type: DraggableBlockType) => void
}) => {
  const { draggedBlockType } = useBlockDnd()
  const [isMouseDown, setIsMouseDown] = useState(false)

  useEffect(() => {
    setIsMouseDown(draggedBlockType === type)
  }, [draggedBlockType, type])

  const handleMouseDown = (e: React.MouseEvent) => onMouseDown(e, type)

  return (
    <Tooltip label="Coming soon!" isDisabled={!isDisabled}>
      <Flex pos="relative">
        <HStack
          borderWidth="1px"
          borderColor="gray.200"
          rounded="lg"
          flex="1"
          cursor={'grab'}
          opacity={isMouseDown || isDisabled ? '0.4' : '1'}
          onMouseDown={handleMouseDown}
          bgColor="gray.50"
          px="4"
          py="2"
          _hover={{ shadow: 'md' }}
          transition="box-shadow 200ms"
          pointerEvents={isDisabled ? 'none' : 'auto'}
        >
          {!isMouseDown ? (
            <>
              <BlockIcon type={type} />
              <BlockTypeLabel type={type} />
            </>
          ) : (
            <Text color="white" userSelect="none">
              Placeholder
            </Text>
          )}
        </HStack>
      </Flex>
    </Tooltip>
  )
}

export const BlockCardOverlay = ({
  type,
  ...props
}: StackProps & { type: BlockType }) => {
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
      <BlockIcon type={type} />
      <BlockTypeLabel type={type} />
    </HStack>
  )
}
