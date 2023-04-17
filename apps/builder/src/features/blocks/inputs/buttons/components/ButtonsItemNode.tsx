import {
  EditablePreview,
  EditableInput,
  Editable,
  Fade,
  IconButton,
  Flex,
} from '@chakra-ui/react'
import { PlusIcon } from '@/components/icons'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { ButtonItem, Item, ItemIndices, ItemType } from '@typebot.io/schemas'
import React, { useRef, useState } from 'react'
import { isNotDefined } from '@typebot.io/lib'

type Props = {
  item: ButtonItem
  indices: ItemIndices
  isMouseOver: boolean
}

export const ButtonsItemNode = ({ item, indices, isMouseOver }: Props) => {
  const { deleteItem, updateItem, createItem } = useTypebot()
  const [itemValue, setItemValue] = useState(item.content ?? 'Click to edit')
  const editableRef = useRef<HTMLDivElement | null>(null)

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

  return (
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
  )
}
