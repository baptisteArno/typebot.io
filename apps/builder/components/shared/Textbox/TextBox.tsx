import {
  ComponentWithAs,
  Flex,
  HStack,
  IconButton,
  InputProps,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TextareaProps,
  Tooltip,
} from '@chakra-ui/react'
import { UserIcon } from 'assets/icons'
import { Variable } from 'models'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { VariableSearchInput } from '../VariableSearchInput'

export type TextBoxProps = {
  onChange: (value: string) => void
  TextBox:
    | ComponentWithAs<'textarea', TextareaProps>
    | ComponentWithAs<'input', InputProps>
  withVariableButton?: boolean
} & Omit<InputProps & TextareaProps, 'onChange'>

export const TextBox = ({
  onChange,
  TextBox,
  withVariableButton = true,
  ...props
}: TextBoxProps) => {
  const textBoxRef = useRef<(HTMLInputElement & HTMLTextAreaElement) | null>(
    null
  )
  const [carretPosition, setCarretPosition] = useState<number>(0)
  const [value, setValue] = useState(props.defaultValue)
  const debounced = useDebouncedCallback(
    (value) => {
      onChange(value)
    },
    process.env.NEXT_PUBLIC_E2E_TEST ? 0 : 1000
  )

  useEffect(
    () => () => {
      debounced.flush()
    },
    [debounced]
  )

  const handleChange = (
    e: ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
  ) => {
    setValue(e.target.value)
    debounced(e.target.value)
  }

  const handleVariableSelected = (variable?: Variable) => {
    if (!textBoxRef.current || !variable) return
    const cursorPosition = carretPosition
    const textBeforeCursorPosition = textBoxRef.current.value.substring(
      0,
      cursorPosition
    )
    const textAfterCursorPosition = textBoxRef.current.value.substring(
      cursorPosition,
      textBoxRef.current.value.length
    )
    const newValue =
      textBeforeCursorPosition +
      `{{${variable.name}}}` +
      textAfterCursorPosition
    setValue(newValue)
    debounced(newValue)
    textBoxRef.current.focus()
    setTimeout(() => {
      if (!textBoxRef.current) return
      textBoxRef.current.selectionStart = textBoxRef.current.selectionEnd =
        carretPosition + `{{${variable.name}}}`.length
      setCarretPosition(textBoxRef.current.selectionStart)
    }, 100)
  }

  const handleKeyUp = () => {
    if (!textBoxRef.current?.selectionStart) return
    setCarretPosition(textBoxRef.current.selectionStart)
  }

  if (!withVariableButton) {
    return (
      <TextBox
        ref={textBoxRef}
        onChange={handleChange}
        bgColor={'white'}
        value={value}
        {...props}
      />
    )
  }
  return (
    <HStack spacing={0} align={'flex-end'}>
      <TextBox
        ref={textBoxRef}
        value={value}
        onKeyUp={handleKeyUp}
        onClick={handleKeyUp}
        onChange={handleChange}
        bgColor={'white'}
        {...props}
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
