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
} from '@chakra-ui/react'
import {
  BubbleStepType,
  DraggableStepType,
  InputStepType,
  IntegrationStepType,
  LogicStepType,
  OctaStepType,
  OctaBubbleStepType,
} from 'models'
import { useStepDnd } from 'contexts/GraphDndContext'
import React, { useState } from 'react'
import { StepCard, StepCardOverlay } from './StepCard'
import { LockedIcon, UnlockedIcon } from 'assets/icons'
import { headerHeight } from 'components/shared/TypebotHeader'

export const StepsSideBar = () => {
  const { setDraggedStepType, draggedStepType } = useStepDnd()
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })
  const [isLocked, setIsLocked] = useState(true)
  const [isExtended, setIsExtended] = useState(true)

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
        bgColor="white"
        spacing={6}
        userSelect="none"
        overflowY="scroll"
        className="hide-scrollbar"
      >
        <Flex justifyContent="flex-end">
          <Tooltip
            label={
              isLocked ? 'Desbloquear barra lateral' : 'Bloquear barra lateral'
            }
          >
            <IconButton
              icon={isLocked ? <LockedIcon /> : <UnlockedIcon />}
              aria-label={isLocked ? 'Unlock' : 'Lock'}
              size="sm"
              variant="outline"
              onClick={handleLockClick}
            />
          </Tooltip>
        </Flex>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600">
            Mensagens
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(BubbleStepType).map((type) => (
              <StepCard
                key={type}
                type={type}
                onMouseDown={handleMouseDown}
                isDisabled={
                  type === BubbleStepType.EMBED ||
                  type === BubbleStepType.IMAGE ||
                  type === BubbleStepType.VIDEO
                }
              />
            ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600">
            Perguntas
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(InputStepType).map((type) => (
              <StepCard
                key={type}
                type={type}
                onMouseDown={handleMouseDown}
                isDisabled={
                  type === InputStepType.DATE ||
                  type === InputStepType.EMAIL ||
                  type === InputStepType.PHONE ||
                  type === InputStepType.NUMBER
                }
              />
            ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600">
            Direcionamentos
          </Text>
          <SimpleGrid columns={1} spacing="3">
            {Object.values(OctaStepType).map((type) => (
              <StepCard
                key={type}
                type={type}
                onMouseDown={handleMouseDown}
                isDisabled={type === OctaStepType.OFFICE_HOURS}
              />
            ))}
          </SimpleGrid>
          <SimpleGrid columns={1} spacing="3">
            {Object.values(OctaBubbleStepType).map((type) => (
              <StepCard key={type} type={type} onMouseDown={handleMouseDown} />
            ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600">
            Validações
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(LogicStepType).map((type) => (
              <StepCard key={type} type={type} onMouseDown={handleMouseDown} />
            ))}
          </SimpleGrid>
        </Stack>

        {/* <Stack>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600">
            Superintegrações
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(IntegrationStepType).map((type) => (
              <StepCard
                key={type}
                type={type}
                onMouseDown={handleMouseDown}
                isDisabled={type === IntegrationStepType.MAKE_COM}
              />
            ))}
          </SimpleGrid>
        </Stack> */}

        {/* <Stack>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600">
            OctaStep
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(OctaStepType).map((type) => (
              <StepCard
                key={type}
                type={type}
                onMouseDown={handleMouseDown}
              />
            ))}
          </SimpleGrid>
        </Stack> */}
        <Stack>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600">
            OctaStep
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(OctaStepType).map((type) => (
              <StepCard key={type} type={type} onMouseDown={handleMouseDown} />
            ))}
          </SimpleGrid>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(OctaBubbleStepType).map((type) => (
              <StepCard key={type} type={type} onMouseDown={handleMouseDown} isDisabled={type === OctaBubbleStepType.END_CONVERSATION} />
            ))}
          </SimpleGrid>
        </Stack>

        {/* {draggedStepType && (
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
        )} */}
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
