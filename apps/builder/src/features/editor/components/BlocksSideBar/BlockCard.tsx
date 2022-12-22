import { Flex, HStack, Tooltip, useColorModeValue } from '@chakra-ui/react'
import { DraggableBlockType } from 'models'
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
          borderColor={useColorModeValue('gray.200', 'gray.800')}
          rounded="lg"
          flex="1"
          cursor={'grab'}
          opacity={isMouseDown || isDisabled ? '0.4' : '1'}
          onMouseDown={handleMouseDown}
          bgColor={useColorModeValue('gray.50', 'gray.850')}
          px="4"
          py="2"
          _hover={useColorModeValue({ shadow: 'md' }, { bgColor: 'gray.800' })}
          transition="box-shadow 200ms, background-color 200ms"
          pointerEvents={isDisabled ? 'none' : 'auto'}
        >
          {!isMouseDown ? (
            <>
              <BlockIcon type={type} />
              <BlockTypeLabel type={type} />
            </>
          ) : null}
        </HStack>
      </Flex>
    </Tooltip>
  )
}
