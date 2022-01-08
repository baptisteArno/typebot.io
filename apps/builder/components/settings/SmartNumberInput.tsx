import {
  NumberInputProps,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'

export const SmartNumberInput = ({
  initialValue,
  onValueChange,
  ...props
}: {
  initialValue?: number
  onValueChange: (value?: number) => void
} & NumberInputProps) => {
  const [value, setValue] = useState(initialValue?.toString() ?? '')

  useEffect(() => {
    if (value.endsWith('.') || value.endsWith(',')) return
    if (value === '') onValueChange(undefined)
    const newValue = parseFloat(value)
    if (isNaN(newValue)) return
    onValueChange(newValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <NumberInput onChange={setValue} value={value} {...props}>
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  )
}
