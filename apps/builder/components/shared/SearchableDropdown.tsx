import {
  Button,
  Flex,
  HStack,
  Input,
  InputProps,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react'
import { Variable } from 'models'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { isEmpty } from 'utils'
import { VariablesButton } from './buttons/VariablesButton'

type Props = {
  selectedItem?: string
  items: string[]
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
  const [carretPosition, setCarretPosition] = useState<number>(0)
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [inputValue, setInputValue] = useState(selectedItem ?? '')
  const debounced = useDebouncedCallback(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onValueChange ? onValueChange : () => { },
    isEmpty(process.env.NEXT_PUBLIC_E2E_TEST) ? debounceTimeout : 0
  )
  const [filteredItems, setFilteredItems] = useState([
    ...items
      .filter((item) =>
        item.toLowerCase().includes((selectedItem ?? '').toLowerCase())
      )
    // .slice(0, 50),
  ])
  const dropdownRef = useRef(null)
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
          item.toLowerCase().includes((inputValue ?? '').toLowerCase())
        )
        .slice(0, 50),
    ])
  }

  const handleItemClick = (item: string) => () => {
    setInputValue(item)
    debounced(item)
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
      `{{${variable.token}}}` +
      textAfterCursorPosition
    setInputValue(newValue)
    debounced(newValue)
    inputRef.current.focus()
    setTimeout(() => {
      if (!inputRef.current) return
      inputRef.current.selectionStart = inputRef.current.selectionEnd =
        carretPosition + `{{${variable.token}}}`.length
      setCarretPosition(inputRef.current.selectionStart)
    }, 100)
  }

  const handleKeyUp = () => {
    if (!inputRef.current?.selectionStart) return
    setCarretPosition(inputRef.current.selectionStart)
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
          <HStack spacing={0} align={'flex-end'}>
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={onInputChange}
              onClick={onOpen}
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
        </PopoverTrigger>
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
          )}
        </PopoverContent>
      </Popover>
    </Flex>
  )
}
