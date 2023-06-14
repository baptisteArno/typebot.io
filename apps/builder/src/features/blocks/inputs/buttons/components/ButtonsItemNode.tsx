import {
  EditablePreview,
  EditableInput,
  Editable,
  Fade,
  IconButton,
  Flex,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  Portal,
  useColorModeValue,
  SlideFade,
} from '@chakra-ui/react'
import { PlusIcon, SettingsIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { ButtonItem, Item, ItemIndices, ItemType } from '@typebot.io/schemas'
import React, { useRef, useState } from 'react'
import { isNotDefined } from '@typebot.io/lib'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { ButtonsItemSettings } from './ButtonsItemSettings'

type Props = {
  item: ButtonItem
  indices: ItemIndices
  isMouseOver: boolean
}

export const ButtonsItemNode = ({ item, indices, isMouseOver }: Props) => {
  const { deleteItem, updateItem, createItem } = useTypebot()
  const { openedItemId, setOpenedItemId } = useGraph()
  const [itemValue, setItemValue] = useState(item.content ?? 'Click to edit')
  const editableRef = useRef<HTMLDivElement | null>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const handleInputSubmit = () => {
    if (itemValue === '') deleteItem(indices)
    else
      updateItem(indices, {
        content: itemValue === '' ? undefined : itemValue,
      } as Item)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && itemValue === 'Click to edit') deleteItem(indices)
    if (e.key === 'Enter' && itemValue !== '' && itemValue !== 'Click to edit')
      handlePlusClick()
  }

  const handlePlusClick = () => {
    const itemIndex = indices.itemIndex + 1
    createItem(
      { blockId: item.blockId, type: ItemType.BUTTON },
      { ...indices, itemIndex }
    )
  }

  const updateItemSettings = (settings: Omit<ButtonItem, 'content'>) => {
    updateItem(indices, { ...item, ...settings })
  }

  return (
    <Popover
      placement="right"
      isLazy
      isOpen={openedItemId === item.id}
      closeOnBlur={false}
    >
      <PopoverAnchor>
        <Flex px={4} py={2} justify="center" w="90%" pos="relative">
          <Editable
            ref={editableRef}
            flex="1"
            startWithEditView={isNotDefined(item.content)}
            value={itemValue}
            onChange={setItemValue}
            onSubmit={handleInputSubmit}
            onKeyDownCapture={handleKeyPress}
            maxW="180px"
          >
            <EditablePreview
              w="full"
              color={item.content !== 'Click to edit' ? 'inherit' : 'gray.500'}
              cursor="pointer"
            />
            <EditableInput />
          </Editable>
          <HitboxExtension />
          <SlideFade
            offsetY="0px"
            offsetX="-10px"
            in={isMouseOver}
            style={{
              position: 'absolute',
              right: '-60px',
              zIndex: 3,
            }}
            unmountOnExit
          >
            <IconButton
              aria-label="Open settings"
              icon={<SettingsIcon />}
              bgColor={useColorModeValue('white', 'gray.800')}
              variant="ghost"
              size="sm"
              shadow="md"
              colorScheme="gray"
              onClick={() => setOpenedItemId(item.id)}
            />
          </SlideFade>
          <Fade
            in={isMouseOver}
            style={{
              position: 'absolute',
              bottom: '-15px',
              zIndex: 3,
              left: '90px',
            }}
            unmountOnExit
          >
            <IconButton
              aria-label="Add item"
              icon={<PlusIcon />}
              size="xs"
              shadow="md"
              colorScheme="gray"
              onClick={handlePlusClick}
            />
          </Fade>
        </Flex>
      </PopoverAnchor>
      <Portal>
        <PopoverContent pos="relative" onMouseDown={handleMouseDown}>
          <PopoverArrow />
          <PopoverBody
            py="6"
            overflowY="scroll"
            maxH="400px"
            shadow="lg"
            ref={ref}
          >
            <ButtonsItemSettings
              item={item}
              onSettingsChange={updateItemSettings}
            />
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  )
}

const HitboxExtension = () => (
  <Flex h="full" w="50px" pos="absolute" top="0" right="-70px" />
)
