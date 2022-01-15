import {
  Button,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
  Stack,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from 'assets/icons'
import React from 'react'

type Props<T> = {
  currentItem: T
  onItemSelect: (item: T) => void
  items: T[]
}

export const DropdownList = <T,>({
  currentItem,
  onItemSelect,
  items,
  ...props
}: Props<T> & MenuButtonProps) => {
  const handleMenuItemClick = (operator: T) => () => {
    onItemSelect(operator)
  }
  return (
    <>
      <Menu isLazy placement="bottom-end">
        <MenuButton
          as={Button}
          rightIcon={<ChevronLeftIcon transform={'rotate(-90deg)'} />}
          colorScheme="gray"
          isTruncated
          justifyContent="space-between"
          textAlign="left"
          {...props}
        >
          {currentItem}
        </MenuButton>
        <MenuList maxW="500px">
          <Stack maxH={'35vh'} overflowY="scroll" spacing="0">
            {items.map((item) => (
              <MenuItem
                key={item as unknown as string}
                maxW="500px"
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                onClick={handleMenuItemClick(item)}
              >
                {item}
              </MenuItem>
            ))}
          </Stack>
        </MenuList>
      </Menu>
    </>
  )
}
