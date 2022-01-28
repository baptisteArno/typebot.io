import {
  useDisclosure,
  useOutsideClick,
  Flex,
  Popover,
  PopoverTrigger,
  Input,
  PopoverContent,
  Button,
  Text,
  InputProps,
} from '@chakra-ui/react'
import { useState, useRef, useEffect, ChangeEvent } from 'react'
import { useDebounce } from 'use-debounce'

type Props = {
  selectedItem?: string
  items: string[]
  onValueChange?: (value: string) => void
  isLoading?: boolean
} & InputProps

export const SearchableDropdown = ({
  selectedItem,
  items,
  onValueChange,
  isLoading = false,
  ...inputProps
}: Props) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [inputValue, setInputValue] = useState(selectedItem ?? '')
  const [debouncedInputValue] = useDebounce(inputValue, 200)
  const [filteredItems, setFilteredItems] = useState([
    ...items
      .filter((item) =>
        item.toLowerCase().includes((selectedItem ?? '').toLowerCase())
      )
      .slice(0, 50),
  ])
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (filteredItems.length > 0) return
    setFilteredItems([
      ...items
        .filter((item) =>
          item.toLowerCase().includes((selectedItem ?? '').toLowerCase())
        )
        .slice(0, 50),
    ])
    if (inputRef.current === document.activeElement) onOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  useOutsideClick({
    ref: dropdownRef,
    handler: onClose,
  })

  useEffect(() => {
    onValueChange &&
      debouncedInputValue !== selectedItem &&
      onValueChange(debouncedInputValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInputValue])

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    if (e.target.value === '') {
      setFilteredItems([...items.slice(0, 50)])
      return
    }
    setFilteredItems([
      ...items
        .filter((item) =>
          item.toLowerCase().includes((inputValue ?? '').toLowerCase())
        )
        .slice(0, 50),
    ])
  }

  const handleItemClick = (item: string) => () => {
    setInputValue(item)
    onClose()
  }

  return (
    <Flex ref={dropdownRef} w="full">
      <Popover
        isOpen={isOpen}
        initialFocusRef={inputRef}
        matchWidth
        offset={[0, 0]}
        isLazy
      >
        <PopoverTrigger>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={onInputChange}
            onClick={onOpen}
            type="text"
            {...inputProps}
          />
        </PopoverTrigger>
        <PopoverContent
          maxH="35vh"
          overflowY="scroll"
          spacing="0"
          role="menu"
          w="inherit"
          shadow="lg"
        >
          {filteredItems.length > 0 ? (
            <>
              {filteredItems.map((item, idx) => {
                return (
                  <Button
                    minH="40px"
                    key={idx}
                    onClick={handleItemClick(item)}
                    fontSize="16px"
                    fontWeight="normal"
                    rounded="none"
                    colorScheme="gray"
                    role="menuitem"
                    variant="ghost"
                    justifyContent="flex-start"
                  >
                    {item}
                  </Button>
                )
              })}
            </>
          ) : (
            <Text p={4} color="gray.500">
              {isLoading ? 'Loading...' : 'Not found.'}
            </Text>
          )}
        </PopoverContent>
      </Popover>
    </Flex>
  )
}
