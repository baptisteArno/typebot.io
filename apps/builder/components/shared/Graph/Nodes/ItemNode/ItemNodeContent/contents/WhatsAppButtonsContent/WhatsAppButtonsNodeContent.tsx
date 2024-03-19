import React, { useEffect, useRef, useState } from 'react'
import {
  EditablePreview,
  EditableInput,
  Editable,
  Fade,
  IconButton,
  Flex,
} from '@chakra-ui/react'

import { useTypebot } from 'contexts/TypebotContext'
import { PlusIcon, TrashIcon } from 'assets/icons'
import { Item, ItemIndices, ItemType } from 'models'
import { isNotDefined } from 'utils'

type Props = {
  item: Item
  indices: ItemIndices
  isMouseOver: boolean
}

export const WhatsAppButtonsNodeContent = ({
  item,
  indices,
  isMouseOver,
}: Props) => {
  const { deleteItem, updateItem, createItem } = useTypebot()
  const [initialContent] = useState(item.content ?? '')
  const [itemValue, setItemValue] = useState(item.content ?? 'Editar botão')
  const editableRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (itemValue !== item.content) setItemValue(item.content ?? 'Editar botão')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  const handleInputSubmit = () => {
    if (itemValue === '') deleteItem(indices)
    else {
      updateItem(indices, { content: itemValue === '' ? undefined : itemValue })
    }
  }

  const hasMoreThanOneItem = () => indices.itemsCount && indices.itemsCount > 1

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && itemValue === 'Editar botão' && hasMoreThanOneItem()) deleteItem(indices)
    if (e.key === 'Enter' && itemValue !== '' && initialContent === '')
      handlePlusClick()
  }

  const handlePlusClick = () => {
    const itemIndex = indices.itemIndex + 1
    createItem(
      {
        stepId: item.stepId,
        type: ItemType.WHATSAPP_BUTTONS_LIST as ItemType.BUTTON,
      },
      { ...indices, itemIndex }
    )
  }

  const handleDeleteClick = () => {
    deleteItem(indices)
  }

  const handleEdit = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.button === 0) {
      const target = e.target as HTMLInputElement
      target.focus()
    }
  }

  return (
    <Flex justify="center" w="100%" pos="relative">
      <Editable
        ref={editableRef}
        startWithEditView={isNotDefined(item.content)}
        value={itemValue}
        onChange={setItemValue}
        onSubmit={handleInputSubmit}
        onKeyDownCapture={handleKeyPress}
        isPreviewFocusable={true}
        onClick={(e) => handleEdit(e)}
        flex="2"
        w="full"
      >
        <EditablePreview
          w="full"
          cursor="pointer"
          color={item.content !== 'Editar botão' ? 'inherit' : 'gray.500'}
          px={4}
          py={2}
        />
        <EditableInput px={4} py={2} maxLength={24} />
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
        {hasMoreThanOneItem() && (
          <IconButton
            aria-label="Delete item"
            icon={<TrashIcon />}
            size="xs"
            shadow="md"
            colorScheme="gray"
            onClick={handleDeleteClick}
          />)}
      </Fade>
    </Flex>
  )
}
