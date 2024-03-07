import {
  EditablePreview,
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
  EditableTextarea,
} from '@chakra-ui/react'
import { PlusIcon, SettingsIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { ButtonItem, Item, ItemIndices } from '@typebot.io/schemas'
import React, { useRef, useState } from 'react'
import { isEmpty } from '@typebot.io/lib'
import { useGraph } from '@/features/graph/providers/GraphProvider'
import { ButtonsItemSettings } from './ButtonsItemSettings'
import { useTranslate } from '@tolgee/react'

type Props = {
  item: ButtonItem
  indices: ItemIndices
  isMouseOver: boolean
}

export const ButtonsItemNode = ({ item, indices, isMouseOver }: Props) => {
  const { t } = useTranslate()
  const { deleteItem, updateItem, createItem } = useTypebot()
  const { openedItemId, setOpenedItemId } = useGraph()
  const [itemValue, setItemValue] = useState(
    item.content ??
      (indices.itemIndex === 0
        ? t('blocks.inputs.button.clickToEdit.label')
        : '')
  )
  const editableRef = useRef<HTMLDivElement | null>(null)
  const ref = useRef<HTMLDivElement | null>(null)
  const arrowColor = useColorModeValue('white', 'gray.800')

  const handleMouseDown = (e: React.MouseEvent) => e.stopPropagation()

  const handleInputSubmit = () => {
    if (itemValue === '') deleteItem(indices)
    else
      updateItem(indices, {
        content: itemValue === '' ? undefined : itemValue,
      } as Item)
  }

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key === 'Escape' &&
      (itemValue === t('blocks.inputs.button.clickToEdit.label') ||
        itemValue === '')
    )
      deleteItem(indices)
    if (
      e.key === 'Enter' &&
      itemValue !== '' &&
      itemValue !== t('blocks.inputs.button.clickToEdit.label')
    )
      handlePlusClick()
  }

  const handleEditableChange = (val: string) => {
    if (val.length - itemValue.length && val.endsWith('\n')) return
    const splittedBreakLines = val.split('\n')
    const splittedCommas = val.split(',')
    const isPastingMultipleItems =
      val.length - itemValue.length > 1 &&
      (splittedBreakLines.length > 2 || splittedCommas.length > 2)
    if (isPastingMultipleItems) {
      const values =
        splittedBreakLines.length > 2 ? splittedBreakLines : splittedCommas
      return values.forEach((v, i) => {
        if (i === 0) {
          setItemValue(v)
        } else {
          createItem(
            { content: v.trim() },
            { ...indices, itemIndex: indices.itemIndex + i }
          )
        }
      })
    }
    setItemValue(val)
  }

  const handlePlusClick = () => {
    const itemIndex = indices.itemIndex + 1
    createItem({}, { ...indices, itemIndex })
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
            startWithEditView={
              isEmpty(item.content) ||
              item.content === t('blocks.inputs.button.clickToEdit.label')
            }
            value={itemValue}
            onChange={handleEditableChange}
            onSubmit={handleInputSubmit}
            onKeyDownCapture={handleKeyPress}
            maxW="180px"
          >
            <EditablePreview
              w="full"
              color={
                item.content !== t('blocks.inputs.button.clickToEdit.label')
                  ? 'inherit'
                  : 'gray.500'
              }
              cursor="pointer"
            />
            <EditableTextarea
              onMouseDownCapture={(e) => e.stopPropagation()}
              resize="none"
              rows={1}
            />
          </Editable>
          <HitboxExtension />
          <SlideFade
            offsetY="0px"
            offsetX="-10px"
            in={isMouseOver}
            style={{
              position: 'absolute',
              left: '-40px',
              zIndex: 3,
            }}
            unmountOnExit
          >
            <Flex bgColor={useColorModeValue('white', 'gray.800')} rounded="md">
              <IconButton
                aria-label={t('blocks.inputs.button.openSettings.ariaLabel')}
                icon={<SettingsIcon />}
                variant="ghost"
                size="sm"
                shadow="md"
                onClick={() => setOpenedItemId(item.id)}
              />
            </Flex>
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
              aria-label={t('blocks.inputs.button.addItem.ariaLabel')}
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
          <PopoverArrow bgColor={arrowColor} />
          <PopoverBody
            py="6"
            overflowY="auto"
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
  <Flex h="full" w="10px" pos="absolute" top="0" left="-10px" />
)
