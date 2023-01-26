import {
  NumberInputProps,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { env } from 'utils'

type Props = {
  value?: number
  debounceTimeout?: number
  withVariableButton?: boolean
  onValueChange: (value?: number) => void
} & NumberInputProps

export const SmartNumberInput = ({
  value,
  onValueChange,
  debounceTimeout = 1000,
  ...props
}: Props) => {
  const [currentValue, setCurrentValue] = useState(value?.toString() ?? '')
  const debounced = useDebouncedCallback(
    onValueChange,
    env('E2E_TEST') === 'true' ? 0 : debounceTimeout
  )

  useEffect(
    () => () => {
      debounced.flush()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleValueChange = (value: string) => {
    setCurrentValue(value)
    if (value.endsWith('.') || value.endsWith(',')) return
    if (value === '') return debounced(undefined)
    const newValue = parseFloat(value)
    if (isNaN(newValue)) return
    debounced(newValue)
  }

  return (
    <NumberInput onChange={handleValueChange} value={currentValue} {...props}>
      <NumberInputField placeholder={props.placeholder} />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  )
}
