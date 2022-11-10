import {
  ComponentWithAs,
  FormControl,
  FormLabel,
  HStack,
  InputProps,
  TextareaProps,
} from '@chakra-ui/react'
import { Variable } from 'models'
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { env } from 'utils'
import { VariablesButton } from '../buttons/VariablesButton'
import { MoreInfoTooltip } from '../MoreInfoTooltip'

export type TextBoxProps = {
  onChange: (value: string) => void
  TextBox:
    | ComponentWithAs<'textarea', TextareaProps>
    | ComponentWithAs<'input', InputProps>
  withVariableButton?: boolean
  debounceTimeout?: number
  label?: string
  moreInfoTooltip?: string
} & Omit<InputProps & TextareaProps, 'onChange'>

export const TextBox = ({
  onChange,
  TextBox,
  withVariableButton = true,
  debounceTimeout = 1000,
  label,
  moreInfoTooltip,
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
    env('E2E_TEST') === 'true' ? 0 : debounceTimeout
  )

  useEffect(() => {
    if (props.defaultValue !== value && value === '' && !isTouched)
      setValue(props.defaultValue ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.defaultValue])

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

  const Input = (
    <TextBox
      ref={textBoxRef}
      value={value}
      onKeyUp={handleKeyUp}
      onClick={handleKeyUp}
      onChange={handleChange}
      bgColor={'white'}
      {...props}
    />
  )

  return (
    <FormControl isRequired={props.isRequired}>
      {label && (
        <FormLabel>
          {label}{' '}
          {moreInfoTooltip && (
            <MoreInfoTooltip>{moreInfoTooltip}</MoreInfoTooltip>
          )}
        </FormLabel>
      )}
      {withVariableButton ? (
        <HStack spacing={0} align={'flex-end'}>
          {Input}
          <VariablesButton onSelectVariable={handleVariableSelected} />
        </HStack>
      ) : (
        Input
      )}
    </FormControl>
  )
}
