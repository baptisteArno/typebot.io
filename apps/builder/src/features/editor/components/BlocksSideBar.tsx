import {
  Stack,
  Text,
  SimpleGrid,
  useEventListener,
  Portal,
  Flex,
  IconButton,
  Tooltip,
  Fade,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  BubbleBlockType,
  DraggableBlockType,
  InputBlockType,
  IntegrationBlockType,
  LogicBlockType,
} from '@typebot.io/schemas'
import { useBlockDnd } from '@/features/graph/providers/GraphDndProvider'
import React, { useState } from 'react'
import { BlockCard } from './BlockCard'
import { LockedIcon, UnlockedIcon } from '@/components/icons'
import { BlockCardOverlay } from './BlockCardOverlay'
import { headerHeight } from '../constants'

export const BlocksSideBar = () => {
  const { setDraggedBlockType, draggedBlockType } = useBlockDnd()
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })
  const [isLocked, setIsLocked] = useState(true)
  const [isExtended, setIsExtended] = useState(true)

  const handleMouseMove = (event: MouseEvent) => {
    if (!draggedBlockType) return
    const { clientX, clientY } = event
    setPosition({
      ...position,
      x: clientX - relativeCoordinates.x,
      y: clientY - relativeCoordinates.y,
    })
  }
  useEventListener('mousemove', handleMouseMove)

  const handleMouseDown = (e: React.MouseEvent, type: DraggableBlockType) => {
    const element = e.currentTarget as HTMLDivElement
    const rect = element.getBoundingClientRect()
    setPosition({ x: rect.left, y: rect.top })
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setRelativeCoordinates({ x, y })
    setDraggedBlockType(type)
  }

  const handleMouseUp = () => {
    if (!draggedBlockType) return
    setDraggedBlockType(undefined)
    setPosition({
      x: 0,
      y: 0,
    })
  }
  useEventListener('mouseup', handleMouseUp)

  const handleLockClick = () => setIsLocked(!isLocked)

  const handleDockBarEnter = () => setIsExtended(true)

  const handleMouseLeave = () => {
    if (isLocked) return
    setIsExtended(false)
  }

  return (
    <Flex
      w="360px"
      pos="absolute"
      left="0"
      h={`calc(100vh - ${headerHeight}px)`}
      zIndex="2"
      pl="4"
      py="4"
      onMouseLeave={handleMouseLeave}
      transform={isExtended ? 'translateX(0)' : 'translateX(-350px)'}
      transition="transform 350ms cubic-bezier(0.075, 0.82, 0.165, 1) 0s"
    >
      <Stack
        w="full"
        rounded="lg"
        shadow="xl"
        borderWidth="1px"
        pt="2"
        pb="10"
        px="4"
        bgColor={useColorModeValue('white', 'gray.900')}
        spacing={6}
        userSelect="none"
        overflowY="scroll"
        className="hide-scrollbar"
      >
        <Flex justifyContent="flex-end">
          <Tooltip label={isLocked ? 'Unlock sidebar' : 'Lock sidebar'}>
            <IconButton
              icon={isLocked ? <LockedIcon /> : <UnlockedIcon />}
              aria-label={isLocked ? 'Unlock' : 'Lock'}
              size="sm"
              onClick={handleLockClick}
            />
          </Tooltip>
        </Flex>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold">
            Bubbles
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(BubbleBlockType).map((type) => (
              <BlockCard key={type} type={type} onMouseDown={handleMouseDown} />
            ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold">
            Inputs
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(InputBlockType).map((type) => (
              <BlockCard key={type} type={type} onMouseDown={handleMouseDown} />
            ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold">
            Logic
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(LogicBlockType).map((type) => (
              <BlockCard key={type} type={type} onMouseDown={handleMouseDown} />
            ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold">
            Integrations
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(IntegrationBlockType).map((type) => (
              <BlockCard key={type} type={type} onMouseDown={handleMouseDown} />
            ))}
          </SimpleGrid>
        </Stack>

        {draggedBlockType && (
          <Portal>
            <BlockCardOverlay
              type={draggedBlockType}
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
      <Fade in={!isLocked} unmountOnExit>
        <Flex
          pos="absolute"
          h="100%"
          right="-50px"
          w="50px"
          top="0"
          justify="center"
          align="center"
          onMouseEnter={handleDockBarEnter}
        >
          <Flex w="5px" h="20px" bgColor="gray.400" rounded="md" />
        </Flex>
      </Fade>
    </Flex>
  )
}
