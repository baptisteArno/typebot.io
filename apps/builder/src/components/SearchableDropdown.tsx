import {
  useDisclosure,
  useOutsideClick,
  Flex,
  Popover,
  Input,
  PopoverContent,
  Button,
  InputProps,
  HStack,
  useColorModeValue,
  PopoverAnchor,
} from '@chakra-ui/react'
import { Variable } from 'models'
import { useState, useRef, useEffect, ChangeEvent, ReactNode } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { env, isDefined } from 'utils'
import { VariablesButton } from '@/features/variables'

type Props = {
  selectedItem?: string
  items: (string | { label: ReactNode; value: string })[]
  debounceTimeout?: number
  withVariableButton?: boolean
  onValueChange?: (value: string) => void
} & InputProps

export const SearchableDropdown = ({
  selectedItem,
  items,
  withVariableButton = false,
  debounceTimeout = 1000,
  onValueChange,
  ...inputProps
}: Props) => {
  const bg = useColorModeValue('gray.200', 'gray.700')
  const [carretPosition, setCarretPosition] = useState<number>(0)
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [inputValue, setInputValue] = useState(selectedItem ?? '')
  const debounced = useDebouncedCallback(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onValueChange ? onValueChange : () => {},
    env('E2E_TEST') === 'true' ? 0 : debounceTimeout
  )
  const [filteredItems, setFilteredItems] = useState([
    ...items
      .filter((item) =>
        (typeof item === 'string' ? item : item.value)
          .toLowerCase()
          .includes((selectedItem ?? '').toLowerCase())
      )
      .slice(0, 50),
  ])
  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState<
    number | undefined
  >()
  const dropdownRef = useRef(null)
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(
    () => () => {
      debounced.flush()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    if (filteredItems.length > 0) return
    setFilteredItems([
      ...items
        .filter((item) =>
          (typeof item === 'string' ? item : item.value)
            .toLowerCase()
            .includes((selectedItem ?? '').toLowerCase())
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

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isOpen) onOpen()
    setInputValue(e.target.value)
    debounced(e.target.value)
    if (e.target.value === '') {
      setFilteredItems([...items.slice(0, 50)])
      return
    }
    setFilteredItems([
      ...items
        .filter((item) =>
          (typeof item === 'string' ? item : item.value)
            .toLowerCase()
            .includes((inputValue ?? '').toLowerCase())
        )
        .slice(0, 50),
    ])
  }

  const handleItemClick = (item: string) => () => {
    setInputValue(item)
    debounced(item)
    setKeyboardFocusIndex(undefined)
    onClose()
  }

  const handleVariableSelected = (variable?: Variable) => {
    if (!inputRef.current || !variable) return
    const cursorPosition = carretPosition
    const textBeforeCursorPosition = inputRef.current.value.substring(
      0,
      cursorPosition
    )
    const textAfterCursorPosition = inputRef.current.value.substring(
      cursorPosition,
      inputRef.current.value.length
    )
    const newValue =
      textBeforeCursorPosition +
      `{{${variable.name}}}` +
      textAfterCursorPosition
    setInputValue(newValue)
    debounced(newValue)
    inputRef.current.focus()
    setTimeout(() => {
      if (!inputRef.current) return
      inputRef.current.selectionStart = inputRef.current.selectionEnd =
        carretPosition + `{{${variable.name}}}`.length
      setCarretPosition(inputRef.current.selectionStart)
    }, 100)
  }

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (inputRef.current?.selectionStart)
      setCarretPosition(inputRef.current.selectionStart)
    if (e.key === 'Enter' && isDefined(keyboardFocusIndex)) {
      const item = filteredItems[keyboardFocusIndex]
      handleItemClick(typeof item === 'string' ? item : item.value)()
      return setKeyboardFocusIndex(undefined)
    }
    if (e.key === 'ArrowDown') {
      if (keyboardFocusIndex === undefined) return setKeyboardFocusIndex(0)
      if (keyboardFocusIndex === filteredItems.length - 1) return
      itemsRef.current[keyboardFocusIndex + 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
      return setKeyboardFocusIndex(keyboardFocusIndex + 1)
    }
    if (e.key === 'ArrowUp') {
      if (keyboardFocusIndex === undefined) return
      if (keyboardFocusIndex === 0) return setKeyboardFocusIndex(undefined)
      itemsRef.current[keyboardFocusIndex - 1]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
      setKeyboardFocusIndex(keyboardFocusIndex - 1)
    }
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
        <PopoverAnchor>
          <HStack spacing={0} align={'flex-end'} w="full">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={onInputChange}
              onFocus={onOpen}
              type="text"
              onKeyUp={handleKeyUp}
              {...inputProps}
            />
            {withVariableButton && (
              <VariablesButton
                onSelectVariable={handleVariableSelected}
                onClick={onClose}
              />
            )}
          </HStack>
        </PopoverAnchor>
        <PopoverContent
          maxH="35vh"
          overflowY="scroll"
          role="menu"
          w="inherit"
          shadow="lg"
        >
          {filteredItems.length > 0 && (
            <>
              {filteredItems.map((item, idx) => {
                return (
                  <Button
                    ref={(el) => (itemsRef.current[idx] = el)}
                    minH="40px"
                    key={idx}
                    onClick={handleItemClick(
                      typeof item === 'string' ? item : item.value
                    )}
                    fontSize="16px"
                    fontWeight="normal"
                    rounded="none"
                    colorScheme="gray"
                    role="menuitem"
                    variant="ghost"
                    bg={keyboardFocusIndex === idx ? bg : 'transparent'}
                    justifyContent="flex-start"
                  >
                    {typeof item === 'string' ? item : item.label}
                  </Button>
                )
              })}
            </>
          )}
        </PopoverContent>
      </Popover>
    </Flex>
  )
}
