import {
  Flex,
  HStack,
  IconButton,
  Input,
  InputProps,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@chakra-ui/react'
import { UserIcon } from 'assets/icons'
import { Variable } from 'models'
import React, { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { VariableSearchInput } from './VariableSearchInput'

export const InputWithVariableButton = ({
  initialValue,
  onChange,
  delay,
  ...props
}: {
  initialValue: string
  onChange: (value: string) => void
  delay?: number
} & Omit<InputProps, 'onChange'>) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [value, setValue] = useState(initialValue)
  const [debouncedValue] = useDebounce(value, delay ?? 100)
  const [carretPosition, setCarretPosition] = useState<number>(0)

  useEffect(() => {
    if (debouncedValue !== initialValue) onChange(debouncedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

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
    setValue(
      textBeforeCursorPosition +
        `{{${variable.name}}}` +
        textAfterCursorPosition
    )
    inputRef.current.focus()
    setTimeout(() => {
      if (!inputRef.current) return
      inputRef.current.selectionStart = inputRef.current.selectionEnd =
        carretPosition + `{{${variable.name}}}`.length
      setCarretPosition(inputRef.current.selectionStart)
    }, 100)
  }

  const handleKeyUp = () => {
    if (!inputRef.current?.selectionStart) return
    setCarretPosition(inputRef.current.selectionStart)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue(e.target.value)

  return (
    <HStack spacing={0}>
      <Input
        ref={inputRef}
        onKeyUp={handleKeyUp}
        onClick={handleKeyUp}
        value={value}
        onChange={handleChange}
        {...props}
        bgColor={'white'}
      />
      <Popover matchWidth isLazy>
        <PopoverTrigger>
          <Flex>
            <Tooltip label="Insert a variable">
              <IconButton
                aria-label="Insert a variable"
                icon={<UserIcon />}
                pos="relative"
              />
            </Tooltip>
          </Flex>
        </PopoverTrigger>
        <PopoverContent w="full">
          <VariableSearchInput
            onSelectVariable={handleVariableSelected}
            placeholder="Search for a variable"
            shadow="lg"
            isDefaultOpen
          />
        </PopoverContent>
      </Popover>
    </HStack>
  )
}
