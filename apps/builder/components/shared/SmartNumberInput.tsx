import {
  NumberInputProps,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

export const SmartNumberInput = ({
  value,
  onValueChange,
  ...props
}: {
  value?: number
  onValueChange: (value?: number) => void
} & NumberInputProps) => {
  const [currentValue, setCurrentValue] = useState(value?.toString() ?? '')
  const [valueToReturn, setValueToReturn] = useState<number | undefined>(
    parseFloat(currentValue)
  )
  const [debouncedValue] = useDebounce(
    valueToReturn,
    process.env.NEXT_PUBLIC_E2E_TEST ? 0 : 1000
  )

  useEffect(() => {
    onValueChange(debouncedValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  const handleValueChange = (value: string) => {
    setCurrentValue(value)
    if (value.endsWith('.') || value.endsWith(',')) return
    if (value === '') return setValueToReturn(undefined)
    const newValue = parseFloat(value)
    if (isNaN(newValue)) return
    setValueToReturn(newValue)
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
