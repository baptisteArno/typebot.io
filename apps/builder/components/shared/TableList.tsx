import { Box, Center, Fade, IconButton, Stack } from '@chakra-ui/react'
import { TrashIcon } from 'assets/icons'
import OctaButton from 'components/octaComponents/OctaButton/OctaButton'
import cuid from 'cuid'
import React, { useEffect, useState } from 'react'

export type ItemWithId<T> = T & { id: string; type: string }

export type TableListItemProps<T> = {
  item: T
  debounceTimeout?: number
  onItemChange: (item: T) => void
  onRemoveItem: (item: T) => void
}

type Props<T> = {
  initialItems: ItemWithId<T>[]
  addLabel?: string
  itemsList?: any[]
  debounceTimeout?: number
  type?: string
  onItemsChange?: (items: ItemWithId<T>[], addedItem?: boolean) => void
  Item: (props: TableListItemProps<T>) => JSX.Element
  shouldHideButton?: boolean
  ComponentBetweenItems?: (props: unknown) => JSX.Element,
  minItems?: number,
  buttonWidth?: string
}

export const TableList = <T,>({
  initialItems,
  onItemsChange,
  addLabel = 'Add',
  type,
  itemsList,
  debounceTimeout,
  Item,
  shouldHideButton,
  ComponentBetweenItems = () => <></>,
  minItems,
  buttonWidth = "100%"
}: Props<T>) => {
  const [items, setItems] = useState(initialItems)
  const [showDeleteIndex, setShowDeleteIndex] = useState<number | null>(null)

  useEffect(() => {
    if (itemsList) {
      setItems(itemsList)
    }
  }, [itemsList])

  const createItem = () => {
    const id = cuid()
    const newItem = { id, type } as ItemWithId<T>
    setItems([...items, newItem])
    if (onItemsChange) onItemsChange([...items, newItem], true)
  }

  const updateItem = (itemIndex: number, updates: Partial<T>) => {
    const newItems = items.map((item, idx) =>
      idx === itemIndex ? { ...item, ...updates } : item
    )
    setItems(newItems)
    if (onItemsChange) onItemsChange(newItems)
  }

  const deleteItem = (itemIndex: number) => () => {
    const newItems = [...items]
    newItems.splice(itemIndex, 1)
    setItems([...newItems])
    if (onItemsChange) onItemsChange([...newItems])
  }

  const handleMouseEnter = (itemIndex: number) => () =>
    setShowDeleteIndex(itemIndex)

  const handleCellChange = (itemIndex: number) => (item: T) =>
    updateItem(itemIndex, item)

  const handleCellDelete = (itemIndex: number) => deleteItem(itemIndex)

  const handleMouseLeave = () => setShowDeleteIndex(null)

  return (
    <Stack spacing="4">
      {items.map((item, itemIndex) => (
        <Box key={item.id}
          onMouseEnter={handleMouseEnter(itemIndex)}
          onMouseLeave={handleMouseLeave}>
          {itemIndex !== 0 && <ComponentBetweenItems />}
          <Item
            item={item}
            onItemChange={handleCellChange(itemIndex)}
            onRemoveItem={handleCellDelete(itemIndex)}
            debounceTimeout={debounceTimeout}
          />
        </Box>
      ))}
      {!shouldHideButton && (
        <Center>
          <OctaButton onClick={createItem} width={buttonWidth}>{addLabel}</OctaButton>
        </Center>
      )}
    </Stack>
  )
}
