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
import { VariablesButton } from '@/features/variables'
import { MoreInfoTooltip } from '../MoreInfoTooltip'

export type TextBoxProps = {
  defaultValue?: string
  onChange: (value: string) => void
  TextBox:
    | ComponentWithAs<'textarea', TextareaProps>
    | ComponentWithAs<'input', InputProps>
  withVariableButton?: boolean
  debounceTimeout?: number
  label?: string
  moreInfoTooltip?: string
} & Omit<InputProps & TextareaProps, 'onChange' | 'defaultValue'>

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
  const [value, setValue] = useState<string>(props.defaultValue ?? '')
  const [carretPosition, setCarretPosition] = useState<number>(
    props.defaultValue?.length ?? 0
  )
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
    if (!variable) return
    setIsTouched(true)
    const textBeforeCursorPosition = value.substring(0, carretPosition)
    const textAfterCursorPosition = value.substring(
      carretPosition,
      value.length
    )
    const newValue =
      textBeforeCursorPosition +
      `{{${variable.name}}}` +
      textAfterCursorPosition
    setValue(newValue)
    debounced(newValue)
    const newCarretPosition = carretPosition + `{{${variable.name}}}`.length
    setCarretPosition(newCarretPosition)
    textBoxRef.current?.focus()
    setTimeout(() => {
      if (!textBoxRef.current) return
      textBoxRef.current.selectionStart = textBoxRef.current.selectionEnd =
        newCarretPosition
    }, 100)
  }

  const updateCarretPosition = () => {
    if (textBoxRef.current?.selectionStart === undefined) return
    setCarretPosition(textBoxRef.current.selectionStart)
  }

  const Input = (
    <TextBox
      ref={textBoxRef}
      value={value}
      onKeyUp={updateCarretPosition}
      onClick={updateCarretPosition}
      onChange={handleChange}
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
