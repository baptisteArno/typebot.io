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
  Stack,
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
import { env } from '@typebot.io/env'
import { MoreInfoTooltip } from '../MoreInfoTooltip'

export type TextInputProps = {
  forceDebounce?: boolean
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
  direction?: 'row' | 'column'
  width?: 'full'
} & Pick<
  InputProps,
  | 'autoComplete'
  | 'onFocus'
  | 'onKeyUp'
  | 'type'
  | 'autoFocus'
  | 'size'
  | 'maxWidth'
  | 'flexShrink'
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
    forceDebounce,
    onChange: _onChange,
    onFocus,
    onKeyUp,
    size,
    maxWidth,
    direction = 'column',
    width,
    flexShrink,
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
    env.NEXT_PUBLIC_E2E_TEST && !forceDebounce ? 0 : debounceTimeout
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
      size={size}
      maxWidth={maxWidth}
    />
  )

  return (
    <FormControl
      isRequired={isRequired}
      as={direction === 'column' ? Stack : HStack}
      justifyContent="space-between"
      width={label || width === 'full' ? 'full' : 'auto'}
      spacing={direction === 'column' ? 2 : 3}
      flexShrink={flexShrink}
    >
      {label && (
        <FormLabel display="flex" flexShrink={0} gap="1" mb="0" mr="0">
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
      {helperText && <FormHelperText mt="0">{helperText}</FormHelperText>}
    </FormControl>
  )
})
