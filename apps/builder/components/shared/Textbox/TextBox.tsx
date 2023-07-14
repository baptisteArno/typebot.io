import {
  ComponentWithAs,
  HStack,
  InputProps,
  TextareaProps,
} from '@chakra-ui/react'
import { Variable } from 'models'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { isEmpty } from 'utils'
import { VariablesButton } from '../buttons/VariablesButton'

export type TextBoxProps = {
  onChange: (value: string) => void
  TextBox:
    | ComponentWithAs<'textarea', TextareaProps>
    | ComponentWithAs<'input', InputProps>
  withVariableButton?: boolean
  debounceTimeout?: number
  handleOpenVariablesSelect?: KeyboardEvent
} & Omit<InputProps & TextareaProps, 'onChange'>

export const TextBox = ({
  onChange,
  TextBox,
  withVariableButton = true,
  debounceTimeout = 1000,
  handleOpenVariablesSelect,
  ...props
}: TextBoxProps) => {
  const textBoxRef = useRef<(HTMLInputElement & HTMLTextAreaElement) | null>(
    null
  )
  const [carretPosition, setCarretPosition] = useState<number>(0)
  const [value, setValue] = useState(props.defaultValue ?? '')
  const [isTouched, setIsTouched] = useState(false)
  const debounced = useDebouncedCallback(
    (value) => {
      onChange(value)
    },
    isEmpty(process.env.NEXT_PUBLIC_E2E_TEST) ? debounceTimeout : 0
  )

  useEffect(() => {
    if (props.defaultValue !== value && value === '' && !isTouched)
      setValue(props.defaultValue ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.defaultValue])

  useEffect(() => {
    if(handleOpenVariablesSelect?.key === '#' && document) {
      (document?.querySelector("#variables-button") as HTMLDivElement)?.click()
    }

  }, [handleOpenVariablesSelect])

  useEffect(
    () => () => {
      debounced.flush()
    },
    [debounced]
  )

  const handleChange = (
    e: ChangeEvent<HTMLInputElement & HTMLTextAreaElement>
  ) => {
    setIsTouched(true)
    setValue(e.target.value)
    debounced(e.target.value)
  }

  const handleVariableSelected = (variable?: Variable) => {
    if (!textBoxRef.current || !variable) return
    setIsTouched(true)
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
      `${variable.token}` +
      textAfterCursorPosition
    setValue(newValue)
    debounced(newValue)
    textBoxRef.current.focus()
    setTimeout(() => {
      if (!textBoxRef.current) return
      textBoxRef.current.selectionStart = textBoxRef.current.selectionEnd =
        carretPosition + `{{${variable.token}}}`.length
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
      <VariablesButton onSelectVariable={handleVariableSelected} id='variables-button' />
    </HStack>
  )
}
