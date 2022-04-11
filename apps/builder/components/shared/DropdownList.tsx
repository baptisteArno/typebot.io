import {
  Button,
  chakra,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
  Portal,
  Stack,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from 'assets/icons'
import React from 'react'

type Props<T> = {
  currentItem?: T
  onItemSelect: (item: T) => void
  items: T[]
  placeholder?: string
}

export const DropdownList = <T,>({
  currentItem,
  onItemSelect,
  items,
  placeholder = '',
  ...props
}: Props<T> & MenuButtonProps) => {
  const handleMenuItemClick = (operator: T) => () => {
    onItemSelect(operator)
  }
  return (
    <Menu isLazy placement="bottom-end" matchWidth>
      <MenuButton
        as={Button}
        rightIcon={<ChevronLeftIcon transform={'rotate(-90deg)'} />}
        colorScheme="gray"
        justifyContent="space-between"
        textAlign="left"
        {...props}
      >
        <chakra.span isTruncated display="block">
          {currentItem ?? placeholder}
        </chakra.span>
      </MenuButton>
      <Portal>
        <MenuList maxW="500px" zIndex={1500}>
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
      </Portal>
    </Menu>
  )
}
