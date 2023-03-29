import { VariablesButton } from '@/features/variables/components/VariablesButton'
import { injectVariableInText } from '@/features/variables/helpers/injectVariableInTextInput'
import { focusInput } from '@/helpers/focusInput'
import {
  FormControl,
  FormLabel,
  HStack,
  Textarea as ChakraTextarea,
  TextareaProps,
} from '@chakra-ui/react'
import { Variable } from '@typebot.io/schemas'
import React, { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { env } from '@typebot.io/lib'
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
  onChange: (value: string) => void
} & Pick<TextareaProps, 'minH'>

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
}: Props) => {
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const [isTouched, setIsTouched] = useState(false)
  const [localValue, setLocalValue] = useState<string>(defaultValue ?? '')
  const [carretPosition, setCarretPosition] = useState<number>(
    localValue.length ?? 0
  )
  const onChange = useDebouncedCallback(
    _onChange,
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
      minH={minH}
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
          {Textarea}
          <VariablesButton onSelectVariable={handleVariableSelected} />
        </HStack>
      ) : (
        Textarea
      )}
    </FormControl>
  )
}
