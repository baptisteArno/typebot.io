import {
  Stack,
  Text,
  SimpleGrid,
  useEventListener,
  Flex,
  IconButton,
  Tooltip,
  Fade,
  Badge,
  Spacer,
  Portal
} from '@chakra-ui/react'
import {
  BubbleStepType,
  DraggableStepType,
  InputStepType,
  IntegrationStepType,
  StepType,
  LogicStepType,
  OctaStepType,
  OctaBubbleStepType,
  OctaWabaStepType
} from 'models'
import { useStepDnd } from 'contexts/GraphDndContext'
import React, { useState } from 'react'
import { StepCard, StepCardOverlay } from './StepCard'
import { LockedIcon, UnlockedIcon, InformationIcon } from 'assets/icons'
import { headerHeight } from 'components/shared/TypebotHeader'
import { useUser } from 'contexts/UserContext'

export const StepsSideBar = () => {
  const { setDraggedStepType, draggedStepType } = useStepDnd()
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })
  const [isLocked, setIsLocked] = useState(true)
  const [isExtended, setIsExtended] = useState(true)

  const { verifyFeatureToggle } = useUser()

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

  const shouldHideComponents = (type: StepType) => {
    return (
      type !== BubbleStepType.EMBED &&
      type !== BubbleStepType.VIDEO &&
      type !== BubbleStepType.IMAGE &&
      type !== InputStepType.URL &&
      type !== InputStepType.PAYMENT &&
      type !== LogicStepType.SET_VARIABLE &&
      type !== LogicStepType.REDIRECT &&
      type !== LogicStepType.CODE &&
      type !== LogicStepType.TYPEBOT_LINK 
    )
  }

  const shouldDisableComponent = (type: StepType) => {
    return (
      // type === InputStepType.DATE ||
      type === InputStepType.PHONE 
      // (type === OctaStepType.OFFICE_HOURS && verifyFeatureToggle('whatsapp-api'))
      // ||
      // type === OctaWabaStepType.BUTTONS && verifyFeatureToggle('whatsapp-api') 
      // ||
      // type === OctaWabaStepType.WHATSAPP_OPTIONS_LIST && verifyFeatureToggle('whatsapp-api') 
      // || type === LogicStepType.CONDITION && verifyFeatureToggle('botconditional')
    )
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
          <Tooltip
            label='Etapa que não requer interação com o usuário'>
            <IconButton
              icon={<InformationIcon marginLeft="5px" />}
              aria-label="back"
              variant="ghost"
              colorScheme="gray"
              mr={1}
            />
          </Tooltip>
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(BubbleStepType).map(
              (type) =>
                shouldHideComponents(type) && (
                  <StepCard
                    key={type}
                    type={type}
                    onMouseDown={handleMouseDown}
                  />
                )
            )}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600">
            Perguntas
            <Tooltip
              label='Etapa em que o usuário interage com o bot'>
              <IconButton
              icon={<InformationIcon marginLeft="5px" />}
              aria-label="back"
              variant="ghost"
              colorScheme="gray"
              mr={1}
            />
            </Tooltip>
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(InputStepType).map(
              (type) =>
                shouldHideComponents(type) && (
                  <StepCard
                    key={type}
                    type={type}
                    onMouseDown={handleMouseDown}
                    isDisabled={shouldDisableComponent(type)}
                  />
                )
            )}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Flex>
            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              Whatsapp Oficial
            </Text>
            <Spacer/>
            <Badge variant='solid' colorScheme='blue' borderRadius="6px" textAlign="center"> 
              Exclusivo
            </Badge>
          </Flex>
          <SimpleGrid columns={1} spacing="3">
            {Object.values(OctaWabaStepType).map(
              (type) =>
                shouldHideComponents(type) && (
                  <StepCard
                    key={type}
                    type={type}
                    onMouseDown={handleMouseDown}
                    isDisabled={shouldDisableComponent(type)}
                  />
                )
            )}
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
                isDisabled={shouldDisableComponent(type)}
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
          <Flex>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600">
            Validações
          </Text>
          <Spacer/>
          </Flex>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(LogicStepType).map(
              (type) =>
                shouldHideComponents(type) && (
                  <StepCard
                    key={type}
                    type={type}
                    onMouseDown={handleMouseDown}
                    isDisabled={shouldDisableComponent(type)}
                  />
                )
            )}
          </SimpleGrid>
        </Stack>
      <Stack>
        <Flex>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600">
            Superintegrações
          </Text>
          <Spacer/>
        </Flex>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(IntegrationStepType).map(
              (type) =>
                shouldHideComponents(type) && (
                  <StepCard
                    key={type}
                    type={type}
                    onMouseDown={handleMouseDown}
                  />
                )
            )}
          </SimpleGrid>
        </Stack>
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
