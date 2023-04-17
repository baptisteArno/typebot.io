import { VariablesButton } from '@/features/variables/components/VariablesButton'
import {
  NumberInputProps,
  NumberInput as ChakraNumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  HStack,
  FormControl,
  FormLabel,
  Stack,
} from '@chakra-ui/react'
import { Variable, VariableString } from '@typebot.io/schemas'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { env } from '@typebot.io/lib'
import { MoreInfoTooltip } from '../MoreInfoTooltip'

type Value<HasVariable> = HasVariable extends true | undefined
  ? number | VariableString
  : number

type Props<HasVariable extends boolean> = {
  defaultValue: Value<HasVariable> | undefined
  debounceTimeout?: number
  withVariableButton?: HasVariable
  label?: string
  moreInfoTooltip?: string
  isRequired?: boolean
  direction?: 'row' | 'column'
  onValueChange: (value?: Value<HasVariable>) => void
} & Omit<NumberInputProps, 'defaultValue' | 'value' | 'onChange' | 'isRequired'>

export const NumberInput = <HasVariable extends boolean>({
  defaultValue,
  onValueChange,
  withVariableButton,
  debounceTimeout = 1000,
  label,
  moreInfoTooltip,
  isRequired,
  direction,
  ...props
}: Props<HasVariable>) => {
  const [value, setValue] = useState(defaultValue?.toString() ?? '')

  const onValueChangeDebounced = useDebouncedCallback(
    onValueChange,
    env('E2E_TEST') === 'true' ? 0 : debounceTimeout
  )

  useEffect(
    () => () => {
      onValueChangeDebounced.flush()
    },
    [onValueChangeDebounced]
  )

  const handleValueChange = (value: string) => {
    setValue(value)
    if (value.endsWith('.') || value.endsWith(',')) return
    if (value === '') return onValueChangeDebounced(undefined)
    if (
      value.startsWith('{{') &&
      value.endsWith('}}') &&
      value.length > 4 &&
      (withVariableButton ?? true)
    ) {
      onValueChangeDebounced(value as Value<HasVariable>)
      return
    }
    const newValue = parseFloat(value)
    if (isNaN(newValue)) return
    onValueChangeDebounced(newValue)
  }

  const handleVariableSelected = (variable?: Variable) => {
    if (!variable) return
    const newValue = `{{${variable.name}}}`
    handleValueChange(newValue)
  }

  const Input = (
    <ChakraNumberInput onChange={handleValueChange} value={value} {...props}>
      <NumberInputField placeholder={props.placeholder} />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </ChakraNumberInput>
  )

  return (
    <FormControl
      as={direction === 'column' ? Stack : HStack}
      isRequired={isRequired}
      justifyContent="space-between"
      width={label ? 'full' : 'auto'}
    >
      {label && (
        <FormLabel mb="0" flexShrink={0}>
          {label}{' '}
          {moreInfoTooltip && (
            <MoreInfoTooltip>{moreInfoTooltip}</MoreInfoTooltip>
          )}
        </FormLabel>
      )}
      {withVariableButton ?? true ? (
        <HStack spacing={0}>
          {Input}
          <VariablesButton onSelectVariable={handleVariableSelected} />
        </HStack>
      ) : (
        Input
      )}
    </FormControl>
  )
}
