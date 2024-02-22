import { VariablesButton } from '@/features/variables/components/VariablesButton'
import { injectVariableInText } from '@/features/variables/helpers/injectVariableInTextInput'
import { focusInput } from '@/helpers/focusInput'
import {
  FormControl,
  FormLabel,
  HStack,
  Textarea as ChakraTextarea,
  TextareaProps,
  FormHelperText,
  Stack,
} from '@chakra-ui/react'
import { Variable } from '@typebot.io/schemas'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { env } from '@typebot.io/env'
import { MoreInfoTooltip } from '../MoreInfoTooltip'

type Props = {
  id?: string
  defaultValue?: string
  debounceTimeout?: number
  label?: string
  moreInfoTooltip?: string
  withVariableButton?: boolean
  isRequired?: boolean
  placeholder?: string
  helperText?: ReactNode
  onChange: (value: string) => void
  direction?: 'row' | 'column'
} & Pick<TextareaProps, 'minH' | 'width'>

export const Textarea = ({
  id,
  defaultValue,
  onChange: _onChange,
  debounceTimeout = 1000,
  label,
  moreInfoTooltip,
  placeholder,
  withVariableButton = true,
  isRequired,
  minH,
  helperText,
  direction = 'column',
  width,
}: Props) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const [isTouched, setIsTouched] = useState(false)
  const [localValue, setLocalValue] = useState<string>(defaultValue ?? '')
  const [carretPosition, setCarretPosition] = useState<number>(
    localValue.length ?? 0
  )
  const onChange = useDebouncedCallback(
    _onChange,
    env.NEXT_PUBLIC_E2E_TEST ? 0 : debounceTimeout
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

  const updateCarretPosition = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const carretPosition = e.target.selectionStart
    if (!carretPosition) return
    setCarretPosition(carretPosition)
  }

  const Textarea = (
    <ChakraTextarea
      ref={inputRef}
      id={id}
      value={localValue}
      onBlur={updateCarretPosition}
      onChange={(e) => changeValue(e.target.value)}
      placeholder={placeholder}
      minH={minH ?? '150px'}
    />
  )

  return (
    <FormControl
      isRequired={isRequired}
      as={direction === 'column' ? Stack : HStack}
      justifyContent="space-between"
      width={label || width === 'full' ? 'full' : 'auto'}
      spacing={direction === 'column' ? 2 : 3}
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
          {Textarea}
          <VariablesButton onSelectVariable={handleVariableSelected} />
        </HStack>
      ) : (
        Textarea
      )}
      {helperText && <FormHelperText mt="0">{helperText}</FormHelperText>}
    </FormControl>
  )
}
