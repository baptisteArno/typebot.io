/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Stack,
  Text,
  SimpleGrid,
  useEventListener,
  Portal,
  Flex,
  IconButton,
  Input,
  Tooltip,
  Fade,
  useColorModeValue,
} from '@chakra-ui/react'
import { useBlockDnd } from '@/features/graph/providers/GraphDndProvider'
import React, { useState } from 'react'
import { BlockCard } from './BlockCard'
import { LockedIcon, UnlockedIcon } from '@/components/icons'
import { BlockCardOverlay } from './BlockCardOverlay'
import { headerHeight } from '../constants'
import { useTranslate } from '@tolgee/react'
import { BubbleBlockType } from '@typebot.io/schemas/features/blocks/bubbles/constants'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { IntegrationBlockType } from '@typebot.io/schemas/features/blocks/integrations/constants'
import { LogicBlockType } from '@typebot.io/schemas/features/blocks/logic/constants'
import { BlockV6 } from '@typebot.io/schemas'
import { useDebouncedCallback } from 'use-debounce'
import { forgedBlocks } from '@typebot.io/forge-repository/definitions'

// Integration blocks migrated to forged blocks
const legacyIntegrationBlocks = [IntegrationBlockType.OPEN_AI]

export const BlocksSideBar = () => {
  const { t } = useTranslate()
  const { setDraggedBlockType, draggedBlockType } = useBlockDnd()
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 })
  const [isLocked, setIsLocked] = useState(true)
  const [isExtended, setIsExtended] = useState(true)
  const [searchInput, setSearchInput] = useState('')

  const closeSideBar = useDebouncedCallback(() => setIsExtended(false), 200)

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

  const handleMouseDown = (e: React.MouseEvent, type: BlockV6['type']) => {
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

  const handleDockBarEnter = () => {
    closeSideBar.flush()
    setIsExtended(true)
  }

  const handleMouseLeave = () => {
    if (isLocked) return
    closeSideBar()
  }

  const handleSearchInputChange = (event: {
    target: { value: React.SetStateAction<string> }
  }) => {
    setSearchInput(event.target.value)
  }
  const blocksArray = Object.values(forgedBlocks)

  const filteredForgedBlockIds = blocksArray
    .filter((block) => {
      return (
        block.id.toLowerCase().includes(searchInput.toLowerCase()) ||
        (block.tags &&
          block.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchInput.toLowerCase())
          )) ||
        block.name.toLowerCase().includes(searchInput.toLowerCase())
      )
    })
    .map((block) => block.id)

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
        pt="4"
        pb="10"
        px="4"
        bgColor={useColorModeValue('white', 'gray.900')}
        spacing={6}
        userSelect="none"
        overflowY="auto"
      >
        <Flex
          justifyContent="space-between"
          w="full"
          alignItems="center"
          gap="3"
        >
          <Input
            placeholder="Search"
            value={searchInput}
            onChange={handleSearchInputChange}
          />
          <Tooltip
            label={
              isLocked
                ? t('editor.sidebarBlocks.sidebar.unlock.label')
                : t('editor.sidebarBlocks.sidebar.lock.label')
            }
          >
            <IconButton
              icon={isLocked ? <LockedIcon /> : <UnlockedIcon />}
              aria-label={
                isLocked
                  ? t('editor.sidebarBlocks.sidebar.icon.unlock.label')
                  : t('editor.sidebarBlocks.sidebar.icon.lock.label')
              }
              size="sm"
              onClick={handleLockClick}
            />
          </Tooltip>
        </Flex>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold">
            {t('editor.sidebarBlocks.blockType.bubbles.heading')}
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(BubbleBlockType)
              .filter((type) =>
                type.toLowerCase().includes(searchInput.toLowerCase())
              )
              .map((type) => (
                <BlockCard
                  key={type}
                  type={type}
                  onMouseDown={handleMouseDown}
                />
              ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold">
            {t('editor.sidebarBlocks.blockType.inputs.heading')}
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(InputBlockType)
              .filter((type) =>
                type.toLowerCase().includes(searchInput.toLowerCase())
              )
              .map((type) => (
                <BlockCard
                  key={type}
                  type={type}
                  onMouseDown={handleMouseDown}
                />
              ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold">
            {t('editor.sidebarBlocks.blockType.logic.heading')}
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(LogicBlockType)
              .filter((type) =>
                type.toLowerCase().includes(searchInput.toLowerCase())
              )
              .map((type) => (
                <BlockCard
                  key={type}
                  type={type}
                  onMouseDown={handleMouseDown}
                />
              ))}
          </SimpleGrid>
        </Stack>

        <Stack>
          <Text fontSize="sm" fontWeight="semibold">
            {t('editor.sidebarBlocks.blockType.integrations.heading')}
          </Text>
          <SimpleGrid columns={2} spacing="3">
            {Object.values(IntegrationBlockType)
              .filter((type) =>
                type.toLowerCase().includes(searchInput.toLowerCase())
              )
              .concat(filteredForgedBlockIds as any)
              .filter((type) => !legacyIntegrationBlocks.includes(type))
              .map((type) => (
                <BlockCard
                  key={type}
                  type={type}
                  onMouseDown={handleMouseDown}
                />
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
          right="-70px"
          w="450px"
          top="0"
          justify="flex-end"
          pr="10"
          align="center"
          onMouseEnter={handleDockBarEnter}
          zIndex={-1}
        >
          <Flex w="5px" h="20px" bgColor="gray.400" rounded="md" />
        </Flex>
      </Fade>
    </Flex>
  )
}
