import {
  Button,
  ButtonProps,
  chakra,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Stack,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@/components/icons'
import React, { ReactNode } from 'react'
import { MoreInfoTooltip } from './MoreInfoTooltip'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props<T extends readonly any[]> = {
  currentItem: T[number] | undefined
  onItemSelect: (item: T[number]) => void
  items: T
  placeholder?: string
  label?: string
  isRequired?: boolean
  direction?: 'row' | 'column'
  helperText?: ReactNode
  moreInfoTooltip?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DropdownList = <T extends readonly any[]>({
  currentItem,
  onItemSelect,
  items,
  placeholder,
  label,
  isRequired,
  direction = 'column',
  helperText,
  moreInfoTooltip,
  ...props
}: Props<T> & ButtonProps) => {
  const handleMenuItemClick = (operator: T[number]) => () => {
    onItemSelect(operator)
  }
  return (
    <FormControl
      isRequired={isRequired}
      as={direction === 'column' ? Stack : HStack}
      justifyContent="space-between"
      width={label ? 'full' : 'auto'}
      spacing={direction === 'column' ? 2 : 3}
    >
      {label && (
        <FormLabel display="flex" flexShrink={0} gap="1" mb="0" mr="0">
          {label}{' '}
          {moreInfoTooltip && (
            <MoreInfoTooltip>{moreInfoTooltip}</MoreInfoTooltip>
          )}
        </FormLabel>
      )}
      <Menu isLazy placement="bottom-end" matchWidth>
        <MenuButton
          as={Button}
          rightIcon={<ChevronLeftIcon transform={'rotate(-90deg)'} />}
          colorScheme="gray"
          justifyContent="space-between"
          textAlign="left"
          w="full"
          {...props}
        >
          <chakra.span noOfLines={1} display="block">
            {currentItem ?? placeholder ?? 'Select an item'}
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
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
