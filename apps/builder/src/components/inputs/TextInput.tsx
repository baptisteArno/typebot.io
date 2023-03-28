import { VariablesButton } from '@/features/variables/components/VariablesButton'
import { injectVariableInText } from '@/features/variables/helpers/injectVariableInTextInput'
import { focusInput } from '@/helpers/focusInput'
import {
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input as ChakraInput,
  InputProps,
} from '@chakra-ui/react'
import { Variable } from '@typebot.io/schemas'
import React, {
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { env } from '@typebot.io/lib'
import { MoreInfoTooltip } from '../MoreInfoTooltip'

export type TextInputProps = {
  defaultValue?: string
  onChange?: (value: string) => void
  debounceTimeout?: number
  label?: ReactNode
  helperText?: ReactNode
  moreInfoTooltip?: string
  withVariableButton?: boolean
  isRequired?: boolean
  placeholder?: string
  isDisabled?: boolean
} & Pick<
  InputProps,
  'autoComplete' | 'onFocus' | 'onKeyUp' | 'type' | 'autoFocus'
>

export const TextInput = forwardRef(function TextInput(
  {
    type,
    defaultValue,
    debounceTimeout = 1000,
    label,
    helperText,
    moreInfoTooltip,
    withVariableButton = true,
    isRequired,
    placeholder,
    autoComplete,
    isDisabled,
    autoFocus,
    onChange: _onChange,
    onFocus,
    onKeyUp,
  }: TextInputProps,
  ref
) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  useImperativeHandle(ref, () => inputRef.current)
  const [isTouched, setIsTouched] = useState(false)
  const [localValue, setLocalValue] = useState<string>(defaultValue ?? '')
  const [carretPosition, setCarretPosition] = useState<number>(
    localValue.length ?? 0
  )
  const onChange = useDebouncedCallback(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    _onChange ?? (() => {}),
    env('E2E_TEST') === 'true' ? 0 : debounceTimeout
  )

  useEffect(() => {
    if (isTouched || localValue !== '' || !defaultValue || defaultValue === '')
      return
    setLocalValue(defaultValue ?? '')
  }, [defaultValue, isTouched, localValue])

  useEffect(
    () => () => {
      onChange.flush()
    },
    [onChange]
  )

  const changeValue = (value: string) => {
    if (!isTouched) setIsTouched(true)
    setLocalValue(value)
    onChange(value)
  }

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) return
    const { text, carretPosition: newCarretPosition } = injectVariableInText({
      variable,
      text: localValue,
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

  const Input = (
    <ChakraInput
      type={type}
      ref={inputRef}
      value={localValue}
      autoComplete={autoComplete}
      placeholder={placeholder}
      isDisabled={isDisabled}
      autoFocus={autoFocus}
      onFocus={onFocus}
      onKeyUp={onKeyUp}
      onBlur={updateCarretPosition}
      onChange={(e) => changeValue(e.target.value)}
    />
  )

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
      {withVariableButton ? (
        <HStack spacing={0} align={'flex-end'}>
          {Input}
          <VariablesButton onSelectVariable={handleVariableSelected} />
        </HStack>
      ) : (
        Input
      )}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
})
