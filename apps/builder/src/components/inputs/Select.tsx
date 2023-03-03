import {
  useDisclosure,
  Flex,
  Popover,
  Input,
  PopoverContent,
  Button,
  useColorModeValue,
  PopoverAnchor,
  Portal,
  InputGroup,
  InputRightElement,
  Text,
  Box,
} from '@chakra-ui/react'
import { useState, useRef, ChangeEvent } from 'react'
import { isDefined } from 'utils'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { useParentModal } from '@/features/graph/providers/ParentModalProvider'
import { ChevronDownIcon } from '../icons'

const dropdownCloseAnimationDuration = 200

type Item = string | { icon?: JSX.Element; label: string; value: string }

type Props = {
  selectedItem?: string
  items: Item[]
  placeholder?: string
  debounceTimeout?: number
  onSelect?: (value: string) => void
}

export const Select = ({
  selectedItem,
  placeholder,
  items,
  onSelect,
}: Props) => {
  const focusedItemBgColor = useColorModeValue('gray.200', 'gray.700')
  const selectedItemBgColor = useColorModeValue('blue.50', 'blue.400')
  const [isTouched, setIsTouched] = useState(false)
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [inputValue, setInputValue] = useState(
    getItemLabel(
      items.find((item) =>
        typeof item === 'string'
          ? selectedItem === item
          : selectedItem === item.value
      )
    )
  )

  const closeDropwdown = () => {
    onClose()
  }

  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState<
    number | undefined
  >()
  const dropdownRef = useRef(null)
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { ref: parentModalRef } = useParentModal()

  const filteredItems = (
    isTouched
      ? [
          ...items.filter((item) =>
            getItemLabel(item)
              .toLowerCase()
              .includes((inputValue ?? '').toLowerCase())
          ),
        ]
      : items
  ).slice(0, 50)

  useOutsideClick({
    ref: dropdownRef,
    handler: closeDropwdown,
  })

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isOpen) onOpen()
    if (!isTouched) setIsTouched(true)
    setInputValue(e.target.value)
  }

  const handleItemClick = (item: Item) => () => {
    if (!isTouched) setIsTouched(true)
    setInputValue(getItemLabel(item))
    onSelect?.(getItemValue(item))
    setKeyboardFocusIndex(undefined)
    closeDropwdown()
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isDefined(keyboardFocusIndex)) {
      handleItemClick(filteredItems[keyboardFocusIndex])()
      return setKeyboardFocusIndex(undefined)
    }
    if (e.key === 'ArrowDown') {
      if (keyboardFocusIndex === undefined) return setKeyboardFocusIndex(0)
      if (keyboardFocusIndex === filteredItems.length - 1)
        return setKeyboardFocusIndex(0)
      itemsRef.current[keyboardFocusIndex + 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
      return setKeyboardFocusIndex(keyboardFocusIndex + 1)
    }
    if (e.key === 'ArrowUp') {
      if (keyboardFocusIndex === 0 || keyboardFocusIndex === undefined)
        return setKeyboardFocusIndex(filteredItems.length - 1)
      itemsRef.current[keyboardFocusIndex - 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
      setKeyboardFocusIndex(keyboardFocusIndex - 1)
    }
  }

  const resetIsTouched = () => {
    setTimeout(() => {
      setIsTouched(false)
    }, dropdownCloseAnimationDuration)
  }

  return (
    <Flex ref={dropdownRef} w="full">
      <Popover
        isOpen={isOpen}
        initialFocusRef={inputRef}
        matchWidth
        offset={[0, 1]}
        isLazy
      >
        <PopoverAnchor>
          <InputGroup>
            <Box pos="absolute" py={2} pl={4} pr={6}>
              {!isTouched && (
                <Text noOfLines={1} data-testid="selected-item-label">
                  {inputValue}
                </Text>
              )}
            </Box>
            <Input
              type="text"
              autoComplete="off"
              ref={inputRef}
              className="select-input"
              value={isTouched ? inputValue : ''}
              placeholder={
                !isTouched && inputValue !== '' ? undefined : placeholder
              }
              onBlur={resetIsTouched}
              onChange={handleInputChange}
              onFocus={onOpen}
              onKeyDown={handleKeyUp}
            />

            <InputRightElement pointerEvents="none" cursor="pointer">
              <ChevronDownIcon />
            </InputRightElement>
          </InputGroup>
        </PopoverAnchor>
        <Portal containerRef={parentModalRef}>
          <PopoverContent
            maxH="35vh"
            overflowY="scroll"
            role="menu"
            w="inherit"
            shadow="lg"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {filteredItems.length > 0 && (
              <>
                {filteredItems.map((item, idx) => {
                  return (
                    <Button
                      ref={(el) => (itemsRef.current[idx] = el)}
                      minH="40px"
                      key={idx}
                      onClick={handleItemClick(item)}
                      fontSize="16px"
                      fontWeight="normal"
                      rounded="none"
                      colorScheme="gray"
                      role="menuitem"
                      variant="ghost"
                      bg={
                        keyboardFocusIndex === idx
                          ? focusedItemBgColor
                          : selectedItem === getItemValue(item)
                          ? selectedItemBgColor
                          : 'transparent'
                      }
                      justifyContent="flex-start"
                      transition="none"
                      leftIcon={
                        typeof item === 'object' ? item.icon : undefined
                      }
                    >
                      {getItemLabel(item)}
                    </Button>
                  )
                })}
              </>
            )}
          </PopoverContent>
        </Portal>
      </Popover>
    </Flex>
  )
}

const getItemLabel = (item?: Item) => {
  if (!item) return ''
  if (typeof item === 'object') return item.label
  return item
}

const getItemValue = (item: Item) => {
  if (typeof item === 'object') return item.value
  return item
}
