import {
  NumberInputProps,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { useState } from 'react'

export const SmartNumberInput = ({
  value,
  onValueChange,
  ...props
}: {
  value?: number
  onValueChange: (value?: number) => void
} & NumberInputProps) => {
  const [currentValue, setCurrentValue] = useState(value?.toString() ?? '')

  const handleValueChange = (value: string) => {
    setCurrentValue(value)
    if (value.endsWith('.') || value.endsWith(',')) return
    if (value === '') return onValueChange(undefined)
    const newValue = parseFloat(value)
    if (isNaN(newValue)) return
    onValueChange(newValue)
  }

  return (
    <NumberInput onChange={handleValueChange} value={currentValue} {...props}>
      <NumberInputField />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  )
}
