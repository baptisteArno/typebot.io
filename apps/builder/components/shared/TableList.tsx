import { Box, Button, Fade, Flex, IconButton, Stack } from '@chakra-ui/react'
import { TrashIcon, PlusIcon } from 'assets/icons'
import { deepEqual } from 'fast-equals'
import { Draft } from 'immer'
import { Table } from 'models'
import React, { useEffect, useState } from 'react'
import { generate } from 'short-uuid'
import { useImmer } from 'use-immer'

export type TableListItemProps<T> = {
  id: string
  item: T
  onItemChange: (item: T) => void
}

type Props<T> = {
  initialItems: Table<T>
  onItemsChange: (items: Table<T>) => void
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
  const [showDeleteId, setShowDeleteId] = useState<string | undefined>()

  useEffect(() => {
    if (deepEqual(items, initialItems)) return
    onItemsChange(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  const createItem = () => {
    setItems((items) => {
      const id = generate()
      items.byId[id] = { id } as unknown as Draft<T>
      items.allIds.push(id)
    })
  }

  const updateItem = (itemId: string, updates: Partial<T>) =>
    setItems((items) => {
      items.byId[itemId] = {
        ...items.byId[itemId],
        ...updates,
      }
    })

  const deleteItem = (itemId: string) => () => {
    setItems((items) => {
      delete items.byId[itemId]
      const index = items.allIds.indexOf(itemId)
      if (index !== -1) items.allIds.splice(index, 1)
    })
  }

  const handleMouseEnter = (itemId: string) => () => setShowDeleteId(itemId)

  const handleCellChange = (itemId: string) => (item: T) =>
    updateItem(itemId, item)

  const handleMouseLeave = () => setShowDeleteId(undefined)

  return (
    <Stack spacing="4">
      {items.allIds.map((itemId, idx) => (
        <Box key={itemId}>
          {idx !== 0 && <ComponentBetweenItems />}
          <Flex
            pos="relative"
            onMouseEnter={handleMouseEnter(itemId)}
            onMouseLeave={handleMouseLeave}
            mt={idx !== 0 && ComponentBetweenItems ? 4 : 0}
          >
            <Item
              id={itemId}
              item={items.byId[itemId]}
              onItemChange={handleCellChange(itemId)}
            />
            <Fade in={showDeleteId === itemId}>
              <IconButton
                icon={<TrashIcon />}
                aria-label="Remove cell"
                onClick={deleteItem(itemId)}
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
