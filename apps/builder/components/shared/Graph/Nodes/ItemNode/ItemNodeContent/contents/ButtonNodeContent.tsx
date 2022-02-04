import {
  EditablePreview,
  EditableInput,
  Editable,
  Fade,
  IconButton,
  Flex,
} from '@chakra-ui/react'
import { PlusIcon } from 'assets/icons'
import { useTypebot } from 'contexts/TypebotContext'
import { ButtonItem, ItemIndices, ItemType } from 'models'
import React, { useRef, useState } from 'react'
import { isNotDefined } from 'utils'

type Props = {
  item: ButtonItem
  indices: ItemIndices
  isLastItem: boolean
  isMouseOver: boolean
}

export const ButtonNodeContent = ({
  item,
  indices,
  isMouseOver,
  isLastItem,
}: Props) => {
  const { deleteItem, updateItem, createItem } = useTypebot()
  const [initialContent] = useState(item.content ?? '')
  const [itemValue, setItemValue] = useState(item.content ?? 'Click to edit')
  const editableRef = useRef<HTMLDivElement | null>(null)

  const handleInputSubmit = () => {
    if (itemValue === '') deleteItem(indices)
    else
      updateItem(indices, { content: itemValue === '' ? undefined : itemValue })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && itemValue === 'Click to edit') deleteItem(indices)
    if (
      e.key === 'Enter' &&
      itemValue !== '' &&
      isLastItem &&
      initialContent === ''
    )
      handlePlusClick()
  }

  const handlePlusClick = () => {
    const itemIndex = indices.itemIndex + 1
    createItem(
      { stepId: item.stepId, type: ItemType.BUTTON },
      { ...indices, itemIndex }
    )
  }

  return (
    <Flex px={4} py={2} justify="center" w="full">
      <Editable
        ref={editableRef}
        flex="1"
        startWithEditView={isNotDefined(item.content)}
        value={itemValue}
        onChange={setItemValue}
        onSubmit={handleInputSubmit}
        onKeyDownCapture={handleKeyPress}
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
        style={{ position: 'absolute', bottom: '-15px', zIndex: 3 }}
        unmountOnExit
      >
        <IconButton
          aria-label="Add item"
          icon={<PlusIcon />}
          size="xs"
          shadow="md"
          colorScheme="blue"
          onClick={handlePlusClick}
        />
      </Fade>
    </Flex>
  )
}
