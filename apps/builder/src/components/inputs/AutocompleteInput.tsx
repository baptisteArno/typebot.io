import {
  useDisclosure,
  Popover,
  PopoverContent,
  Button,
  useColorModeValue,
  PopoverAnchor,
  Portal,
  Input,
  HStack,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { useState, useRef, useEffect, ReactNode } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { env, isDefined } from '@typebot.io/lib'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { useParentModal } from '@/features/graph/providers/ParentModalProvider'
import { VariablesButton } from '@/features/variables/components/VariablesButton'
import { Variable } from '@typebot.io/schemas'
import { injectVariableInText } from '@/features/variables/helpers/injectVariableInTextInput'
import { focusInput } from '@/helpers/focusInput'
import { MoreInfoTooltip } from '../MoreInfoTooltip'

type Props = {
  items: string[]
  value?: string
  defaultValue?: string
  debounceTimeout?: number
  placeholder?: string
  withVariableButton?: boolean
  label?: ReactNode
  moreInfoTooltip?: string
  isRequired?: boolean
  onChange: (value: string) => void
}

export const AutocompleteInput = ({
  items,
  onChange: _onChange,
  debounceTimeout,
  placeholder,
  withVariableButton = true,
  value,
  defaultValue,
  label,
  moreInfoTooltip,
  isRequired,
}: Props) => {
  const bg = useColorModeValue('gray.200', 'gray.700')
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [isTouched, setIsTouched] = useState(false)
  const [inputValue, setInputValue] = useState(defaultValue ?? '')
  const [carretPosition, setCarretPosition] = useState<number>(
    inputValue.length ?? 0
  )

  const onChange = useDebouncedCallback(
    _onChange,
    env('E2E_TEST') === 'true' ? 0 : debounceTimeout
  )

  useEffect(() => {
    if (isTouched || inputValue !== '' || !defaultValue || defaultValue === '')
      return
    setInputValue(defaultValue ?? '')
  }, [defaultValue, inputValue, isTouched])

  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState<
    number | undefined
  >()
  const dropdownRef = useRef(null)
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([])
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)
  const { ref: parentModalRef } = useParentModal()

  const filteredItems = (
    inputValue === ''
      ? items
      : [
          ...items.filter(
            (item) =>
              item.toLowerCase().startsWith((inputValue ?? '').toLowerCase()) &&
              item.toLowerCase() !== inputValue.toLowerCase()
          ),
        ]
  ).slice(0, 50)

  useOutsideClick({
    ref: dropdownRef,
    handler: onClose,
    isEnabled: isOpen,
  })

  useEffect(
    () => () => {
      onChange.flush()
    },
    [onChange]
  )

  const changeValue = (value: string) => {
    if (!isTouched) setIsTouched(true)
    if (!isOpen) onOpen()
    setInputValue(value)
    onChange(value)
  }

  const handleItemClick = (value: string) => () => {
    setInputValue(value)
    onChange(value)
    setKeyboardFocusIndex(undefined)
    inputRef.current?.focus()
  }

  const updateFocusedDropdownItem = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
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

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) return
    const { text, carretPosition: newCarretPosition } = injectVariableInText({
      variable,
      text: inputValue,
      at: carretPosition,
    })
    changeValue(text)
    focusInput({ at: newCarretPosition, input: inputRef.current })
  }

  const updateCarretPosition = (e: React.FocusEvent<HTMLInputElement>) => {
    const carretPosition = e.target.selectionStart
    if (!carretPosition) return
    setCarretPosition(carretPosition)
  }

  return (
    <FormControl isRequired={isRequired}>
      {label && (
        <FormLabel>
          {label}{' '}
          {moreInfoTooltip && (
            <MoreInfoTooltip>{moreInfoTooltip}</MoreInfoTooltip>
          )}
        </FormLabel>
      )}
      <HStack ref={dropdownRef} spacing={0} w="full">
        <Popover
          isOpen={isOpen}
          initialFocusRef={inputRef}
          matchWidth
          offset={[0, 1]}
          isLazy
        >
          <PopoverAnchor>
            <Input
              autoComplete="off"
              ref={inputRef}
              value={value ?? inputValue}
              onChange={(e) => changeValue(e.target.value)}
              onFocus={onOpen}
              onBlur={updateCarretPosition}
              onKeyDown={updateFocusedDropdownItem}
              placeholder={placeholder}
            />
          </PopoverAnchor>
          {filteredItems.length > 0 && (
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
                        bg={keyboardFocusIndex === idx ? bg : 'transparent'}
                        justifyContent="flex-start"
                        transition="none"
                      >
                        {item}
                      </Button>
                    )
                  })}
                </>
              </PopoverContent>
            </Portal>
          )}
        </Popover>
        {withVariableButton && (
          <VariablesButton onSelectVariable={handleVariableSelected} />
        )}
      </HStack>
    </FormControl>
  )
}
