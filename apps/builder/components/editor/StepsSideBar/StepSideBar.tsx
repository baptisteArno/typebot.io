import {
  Stack,
  Text,
  SimpleGrid,
  useEventListener,
  Flex,
  IconButton,
  Tooltip,
  Fade,
  Spacer,
  Portal,
  HStack,
  useDisclosure,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import {
  BubbleStepType,
  DraggableStepType,
  InputStepType,
  IntegrationStepType,
  StepType,
  LogicStepType,
  OctaStepType,
  OctaBubbleStepType,
  OctaWabaStepType,
  WOZStepType,
} from 'models'
import { useStepDnd } from 'contexts/GraphDndContext'
import React, { useState } from 'react'
import { StepCard, StepCardOverlay } from './StepCard'
import { LockedIcon, UnlockedIcon } from 'assets/icons'
import { useUser } from 'contexts/UserContext'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'

export const StepsSideBar = () => {
  const { setDraggedStepType, draggedStepType } = useStepDnd()

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })

  const { workspace } = useWorkspace()

  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })

  const [isLocked, setIsLocked] = useState(true)

  const [isExtended, setIsExtended] = useState(true)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { typebot } = useTypebot()

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

  const isValidComponent = (type: StepType) => {
    return (
      type !== BubbleStepType.EMBED &&
      type !== BubbleStepType.VIDEO &&
      type !== BubbleStepType.IMAGE &&
      type !== InputStepType.URL &&
      type !== InputStepType.PAYMENT &&
      type !== LogicStepType.SET_VARIABLE &&
      type !== LogicStepType.REDIRECT &&
      type !== LogicStepType.CODE &&
      type !== LogicStepType.TYPEBOT_LINK &&
      type !== InputStepType.DATE &&
      type !== OctaStepType.CALL_OTHER_BOT
    )
  }

  const EVENT_AVAILABLE_STEPS: StepType[] = [IntegrationStepType.WEBHOOK]

  const LIMITED_DOMAINS = ['person', 'ticket']

  const isValidToCurrentDomain = (type: StepType) => {
    if (LIMITED_DOMAINS.includes(typebot?.domain || 'chat')) {
      return type === IntegrationStepType.WEBHOOK
    }

    return true
  }

  const isAvailableFor = (type: StepType) => {
    if (!typebot?.availableFor?.length) {
      return true
    }

    if (typebot.availableFor.includes('event')) {
      return EVENT_AVAILABLE_STEPS.includes(type)
    }

    return true
  }

  const shouldShowComponent = (type: StepType) => {
    if (!isValidComponent(type)) {
      return false
    }

    if (!isValidToCurrentDomain(type)) {
      return false
    }

    return isAvailableFor(type)
  }

  const shouldDisableComponent = (type: StepType) => {
    return (
      workspace?.channel === 'whatsapp' &&
      ((type === OctaWabaStepType.WHATSAPP_BUTTONS_LIST &&
        !verifyFeatureToggle('whatsapp-api')) ||
        (type === OctaWabaStepType.WHATSAPP_OPTIONS_LIST &&
          !verifyFeatureToggle('whatsapp-api')) ||
        (type === OctaWabaStepType.COMMERCE &&
          !verifyFeatureToggle('whatsapp-api')))
    )
  }

  const wabaMessageComponent = () => {
    return [OctaWabaStepType.COMMERCE]
  }

  const getBaseUrl = () => {
    return (
      (process.env.MAIN_CLIENT_BASE_URL ||
        (window as any).MAIN_CLIENT_BASE_URL) + '/bot-builder/channel'
    )
  }

  const validationSteps = Object.values(LogicStepType).filter((step) =>
    shouldShowComponent(step)
  )
  const inputSteps = Object.values(InputStepType).filter((step) =>
    shouldShowComponent(step)
  )
  const octaWabaSteps = Object.values(OctaWabaStepType).filter(
    (s) => !wabaMessageComponent().includes(s) && shouldShowComponent(s)
  )
  const bubbleSteps = Object.values(BubbleStepType).filter((step) =>
    shouldShowComponent(step)
  )
  const wabaMessageSteps = wabaMessageComponent().filter(
    (step) =>
      shouldShowComponent(step) &&
      workspace?.channel === 'whatsapp' &&
      verifyFeatureToggle('commerce-enabled')
  )
  const wozSteps = Object.values(WOZStepType).filter(
    (step) => shouldShowComponent(step) && verifyFeatureToggle('chat-ai')
  )
  const octaBubbleSteps = Object.values(OctaBubbleStepType).filter((step) =>
    shouldShowComponent(step)
  )
  const octaSteps = Object.values(OctaStepType).filter((step) =>
    shouldShowComponent(step)
  )
  const integrationSteps = Object.values(IntegrationStepType).filter((step) =>
    shouldShowComponent(step)
  )

  return (
    <Flex
      w="375px"
      pos="absolute"
      left="0"
      h="100vh"
      zIndex="2"
      onMouseLeave={handleMouseLeave}
      transform={isExtended ? 'translateX(0)' : 'translateX(-350px)'}
      transition="transform 350ms cubic-bezier(0.075, 0.82, 0.165, 1) 0s"
    >
      <Stack
        w="full"
        rounded="lg"
        borderEndEndRadius={0}
        shadow="xl"
        borderWidth="1px"
        borderLeft={0}
        borderBottom={0}
        pt="2"
        pb="10"
        px="4"
        bgColor="white"
        spacing={6}
        userSelect="none"
        overflowY="scroll"
        className="hide-scrollbar"
      >
        <HStack w="full">
          <Text fontSize="lg" fontWeight="bold" color="gray.600">
            Etapas da conversa
          </Text>

          <Spacer />

          <Flex>
            <Tooltip
              label={
                isLocked
                  ? 'Desbloquear barra lateral'
                  : 'Bloquear barra lateral'
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
        </HStack>
        {(bubbleSteps.length || wabaMessageSteps.length) && (
          <Stack>
            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              Mensagens
              <Tooltip
                hasArrow
                label="Etapa que não requer interação com o usuário"
                bg="gray.700"
                color="white"
                width={'200px'}
              >
                <InfoIcon marginLeft={'10px'} color={'gray.300'} />
              </Tooltip>
            </Text>
            <SimpleGrid columns={1} spacing="3">
              {bubbleSteps.map((type) => (
                <StepCard
                  key={type}
                  type={type}
                  onMouseDown={handleMouseDown}
                />
              ))}
              {wabaMessageSteps.map((type) => (
                <StepCard
                  key={type}
                  type={type}
                  onMouseDown={handleMouseDown}
                  badge={'WAB'}
                  isDisabled={shouldDisableComponent(type)}
                />
              ))}
            </SimpleGrid>
          </Stack>
        )}
        {wozSteps.length && (
          <Stack>
            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              WOZ - IA da Octa
            </Text>
            <SimpleGrid columns={1} spacing="3">
              {wozSteps.map((type) => (
                <StepCard
                  key={type}
                  type={type}
                  onMouseDown={handleMouseDown}
                  isDisabled={shouldDisableComponent(type)}
                />
              ))}
            </SimpleGrid>
          </Stack>
        )}
        {inputSteps.length && (
          <Stack>
            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              Perguntas
              <Tooltip
                hasArrow
                label="Etapa em que o usuário interage com o bot"
                bg="gray.700"
                color="white"
                width={'200px'}
              >
                <InfoIcon marginLeft={'10px'} color={'gray.300'} />
              </Tooltip>
            </Text>
            <SimpleGrid columns={1} spacing="3">
              {inputSteps.map((type) => (
                <StepCard
                  key={type}
                  type={type}
                  onMouseDown={handleMouseDown}
                  isDisabled={shouldDisableComponent(type)}
                />
              ))}
              {workspace?.channel === 'whatsapp' &&
                octaWabaSteps.map((type) => (
                  <StepCard
                    key={type}
                    type={type}
                    onMouseDown={handleMouseDown}
                    badge={'WAB'}
                    isDisabled={shouldDisableComponent(type)}
                  />
                ))}
            </SimpleGrid>
          </Stack>
        )}
        {(octaSteps.length || octaBubbleSteps.length) && (
          <Stack>
            <Text fontSize="sm" fontWeight="semibold" color="gray.600">
              Direcionamentos
            </Text>
            {octaSteps.length && (
              <SimpleGrid columns={1} spacing="3">
                {octaSteps.map((type) => (
                  <StepCard
                    key={type}
                    type={type}
                    onMouseDown={handleMouseDown}
                    isDisabled={shouldDisableComponent(type)}
                  />
                ))}
              </SimpleGrid>
            )}
            {octaBubbleSteps.length && (
              <SimpleGrid columns={1} spacing="3">
                {octaBubbleSteps.map((type) => (
                  <StepCard
                    key={type}
                    type={type}
                    onMouseDown={handleMouseDown}
                  />
                ))}
              </SimpleGrid>
            )}
          </Stack>
        )}
        {validationSteps.length && (
          <Stack>
            <Flex>
              <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                Validações
              </Text>
              <Spacer />
            </Flex>
            <SimpleGrid columns={1} spacing="3">
              {validationSteps.map(
                (type) =>
                  shouldShowComponent(type) && (
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
        )}
        {integrationSteps.length && (
          <Stack>
            <Flex>
              <Text fontSize="sm" fontWeight="semibold" color="gray.600">
                Superintegrações
              </Text>
              <Spacer />
            </Flex>
            <SimpleGrid columns={1} spacing="3">
              {integrationSteps.map((type) => (
                <StepCard
                  key={type}
                  type={type}
                  onMouseDown={handleMouseDown}
                />
              ))}
            </SimpleGrid>
          </Stack>
        )}
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
