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
  Spacer
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
  WabaStepType
} from 'models'
import { useStepDnd } from 'contexts/GraphDndContext'
import React, { useState } from 'react'
import { StepCard } from './StepCard'
import { LockedIcon, UnlockedIcon, InfoIcon } from 'assets/icons'
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

  const shouldHideComponents = (type: StepType) => {
    return (
      type !== BubbleStepType.IMAGE &&
      type !== BubbleStepType.VIDEO &&
      type !== InputStepType.URL &&
      type !== InputStepType.PAYMENT &&
      type !== InputStepType.ASK_NAME &&
      type !== LogicStepType.SET_VARIABLE &&
      type !== LogicStepType.REDIRECT &&
      type !== LogicStepType.CODE &&
      type !== LogicStepType.TYPEBOT_LINK &&
      type !== IntegrationStepType.EMAIL &&
      type !== IntegrationStepType.GOOGLE_ANALYTICS &&
      type !== IntegrationStepType.GOOGLE_SHEETS &&
      type !== IntegrationStepType.MAKE_COM &&
      type !== IntegrationStepType.PABBLY_CONNECT &&
      type !== IntegrationStepType.ZAPIER
    )
  }

  const shouldDisableComponent = (type: StepType) => {
    return (
      type === InputStepType.DATE ||
      type === InputStepType.PHONE ||
      type === OctaStepType.OFFICE_HOURS ||
      type === WabaStepType.BUTTONS ||
      type === WabaStepType.OPTIONS
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
              <InfoIcon marginLeft="5px" />
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
              <InfoIcon marginLeft="5px" />
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
            {Object.values(WabaStepType).map(
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
          <Badge variant='solid' colorScheme='purple' borderRadius="6px" textAlign="center"> 
            PLANO SEA
          </Badge>
          </Flex>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(LogicStepType).map(
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
        <Flex>
          <Text fontSize="sm" fontWeight="semibold" color="gray.600">
            Superintegrações
          </Text>
          <Spacer/>
          <Badge variant='solid' colorScheme='purple' borderRadius="6px" textAlign="center"> 
            PLANO SEA
          </Badge>
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
