import {
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightElement,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@chakra-ui/react'
import { UserIcon } from 'assets/icons'
import { Variable } from 'models'
import React, { useEffect, useRef, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { VariableSearchInput } from './VariableSearchInput'

export const InputWithVariable = ({
  initialValue,
  noAbsolute,
  onValueChange,
  ...props
}: {
  initialValue: string
  onValueChange: (value: string) => void
  noAbsolute?: boolean
} & InputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [value, setValue] = useState(initialValue)
  const [debouncedValue] = useDebounce(value, 100)
  const [carretPosition, setCarretPosition] = useState<number>(0)

  useEffect(() => {
    onValueChange(debouncedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  const handleVariableSelected = (variable: Variable) => {
    if (!inputRef.current) return
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
    }, 100)
  }

  const handleKeyUp = () => {
    if (!inputRef.current?.selectionStart) return
    setCarretPosition(inputRef.current.selectionStart)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue(e.target.value)

  return (
    <InputGroup>
      <Input
        ref={inputRef}
        onKeyUp={handleKeyUp}
        onClick={handleKeyUp}
        value={value}
        onChange={handleChange}
        {...props}
        bgColor={'white'}
      />
      <InputRightElement
        pos={noAbsolute ? 'relative' : 'absolute'}
        zIndex={noAbsolute ? 'unset' : '1'}
      >
        <Popover matchWidth isLazy>
          <PopoverTrigger>
            <IconButton
              aria-label="Insert a variable"
              icon={<UserIcon />}
              size="sm"
              pos="relative"
            />
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
      </InputRightElement>
    </InputGroup>
  )
}
