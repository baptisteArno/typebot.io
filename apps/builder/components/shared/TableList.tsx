import { Box, Button, Fade, Flex, IconButton, Stack } from '@chakra-ui/react'
import { TrashIcon, PlusIcon } from 'assets/icons'
import OctaButton from 'components/octaComponents/OctaButton/OctaButton'
import cuid from 'cuid'
import React, { useEffect, useState } from 'react'

type ItemWithId<T> = T & { id: string; type: string }

export type TableListItemProps<T> = {
  item: T
  debounceTimeout?: number
  onItemChange: (item: T) => void
}

type Props<T> = {
  initialItems: ItemWithId<T>[]
  addLabel?: string
  itemsList?: any[]
  debounceTimeout?: number
  type?: string
  onItemsChange?: (items: ItemWithId<T>[]) => void
  Item: (props: TableListItemProps<T>) => JSX.Element
  shouldHideButton?: boolean
  ComponentBetweenItems?: (props: unknown) => JSX.Element
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
}: Props<T>) => {
  const [items, setItems] = useState(initialItems)
  const [showDeleteIndex, setShowDeleteIndex] = useState<number | null>(null)

  useEffect(() => {
    if (itemsList) setItems(itemsList)
  }, [itemsList])

  const createItem = () => {
    const id = cuid()
    const newItem = { id, type } as ItemWithId<T>
    setItems([...items, newItem])
    if (onItemsChange) onItemsChange([...items, newItem])
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

  const handleMouseLeave = () => setShowDeleteIndex(null)

  return (
    <Stack spacing="4">
      {items.map((item, itemIndex) => (
        <Box key={item.id}>
          {itemIndex !== 0 && <ComponentBetweenItems />}
          <Flex
            pos="relative"
            onMouseEnter={handleMouseEnter(itemIndex)}
            onMouseLeave={handleMouseLeave}
          >
            <Item
              item={item}
              onItemChange={handleCellChange(itemIndex)}
              debounceTimeout={debounceTimeout}
            />
            <Fade in={showDeleteIndex === itemIndex}>
              <IconButton
                icon={<TrashIcon />}
                aria-label="Remove cell"
                onClick={deleteItem(itemIndex)}
                pos="absolute"
                left="-15px"
                top="-15px"
                size="sm"
                shadow="md"
              />
            </Fade>
          </Flex>
        </Box>
      ))}
      {!shouldHideButton && (
        <OctaButton onClick={createItem}>{addLabel}</OctaButton>
      )}
    </Stack>
  )
}
