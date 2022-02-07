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
import React, { useEffect, useRef, useState } from 'react'
import { VariableSearchInput } from '../VariableSearchInput'

export type TextBoxWithVariableButtonProps = {
  initialValue: string
  onChange: (value: string) => void
  TextBox:
    | ComponentWithAs<'textarea', TextareaProps>
    | ComponentWithAs<'input', InputProps>
} & Omit<InputProps & TextareaProps, 'onChange'>

export const TextBoxWithVariableButton = ({
  initialValue,
  onChange,
  TextBox,
  ...props
}: TextBoxWithVariableButtonProps) => {
  const textBoxRef = useRef<(HTMLInputElement & HTMLTextAreaElement) | null>(
    null
  )
  const [value, setValue] = useState(initialValue)
  const [carretPosition, setCarretPosition] = useState<number>(0)

  useEffect(() => {
    onChange(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

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
    setValue(
      textBeforeCursorPosition +
        `{{${variable.name}}}` +
        textAfterCursorPosition
    )
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setValue(e.target.value)

  return (
    <HStack spacing={0} align={'flex-end'}>
      <TextBox
        ref={textBoxRef}
        onKeyUp={handleKeyUp}
        onClick={handleKeyUp}
        value={value}
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
