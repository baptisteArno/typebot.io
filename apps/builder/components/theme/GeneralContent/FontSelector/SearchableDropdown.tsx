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
} from '@chakra-ui/react'
import { useState, useRef, useEffect, ChangeEvent } from 'react'

export const SearchableDropdown = ({
  selectedItem,
  items,
  onSelectItem,
}: {
  selectedItem?: string
  items: string[]
  onSelectItem: (value: string) => void
}) => {
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [inputValue, setInputValue] = useState(selectedItem)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  useOutsideClick({
    ref: dropdownRef,
    handler: onClose,
  })

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

  return (
    <Flex ref={dropdownRef}>
      <Popover isOpen={isOpen} initialFocusRef={inputRef}>
        <PopoverTrigger>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={onInputChange}
            onClick={onOpen}
            w="300px"
          />
        </PopoverTrigger>
        <PopoverContent maxH="35vh" overflowY="scroll" spacing="0" w="300px">
          {filteredItems.length > 0 ? (
            <>
              {filteredItems.map((item, idx) => {
                return (
                  <Button
                    minH="40px"
                    key={idx}
                    onClick={() => {
                      setInputValue(item)
                      onSelectItem(item)
                      onClose()
                    }}
                    fontSize="16px"
                    fontWeight="normal"
                    rounded="none"
                    colorScheme="gray"
                    variant="ghost"
                    justifyContent="flex-start"
                  >
                    {item}
                  </Button>
                )
              })}
            </>
          ) : (
            <Text p={4}>Not found.</Text>
          )}
        </PopoverContent>
      </Popover>
    </Flex>
  )
}
