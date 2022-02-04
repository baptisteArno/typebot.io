import { Box, Button, Fade, Flex, IconButton, Stack } from '@chakra-ui/react'
import { TrashIcon, PlusIcon } from 'assets/icons'
import { deepEqual } from 'fast-equals'
import { Draft } from 'immer'
import React, { useEffect, useState } from 'react'
import { generate } from 'short-uuid'
import { useImmer } from 'use-immer'

type ItemWithId<T> = T & { id: string }

export type TableListItemProps<T> = {
  item: T
  onItemChange: (item: T) => void
}

type Props<T> = {
  initialItems: ItemWithId<T>[]
  onItemsChange: (items: ItemWithId<T>[]) => void
  addLabel?: string
  Item: (props: TableListItemProps<T>) => JSX.Element
  ComponentBetweenItems?: (props: unknown) => JSX.Element
}

export const TableList = <T,>({
  initialItems,
  onItemsChange,
  addLabel = 'Add',
  Item,
  ComponentBetweenItems = () => <></>,
}: Props<T>) => {
  const [items, setItems] = useImmer(initialItems)
  const [showDeleteIndex, setShowDeleteIndex] = useState<number | null>(null)

  useEffect(() => {
    if (deepEqual(items, initialItems)) return
    onItemsChange(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const createItem = () => {
    setItems((items) => {
      const id = generate()
      const newItem = { id } as Draft<ItemWithId<T>>
      items.push(newItem)
    })
  }

  const updateItem = (itemIndex: number, updates: Partial<T>) =>
    setItems((items) => {
      items[itemIndex] = { ...items[itemIndex], ...updates }
    })

  const deleteItem = (itemIndex: number) => () => {
    setItems((items) => {
      items.splice(itemIndex, 1)
    })
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
            mt={itemIndex !== 0 && ComponentBetweenItems ? 4 : 0}
          >
            <Item item={item} onItemChange={handleCellChange(itemIndex)} />
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
      <Button
        leftIcon={<PlusIcon />}
        onClick={createItem}
        flexShrink={0}
        colorScheme="blue"
      >
        {addLabel}
      </Button>
    </Stack>
  )
}
