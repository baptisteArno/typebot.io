import { VariablesButton } from '@/features/variables'
import {
  NumberInputProps,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  HStack,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { Variable, VariableString } from 'models'
import { useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { env } from 'utils'
import { MoreInfoTooltip } from '../MoreInfoTooltip'

type Value<HasVariable> = HasVariable extends undefined | true
  ? number | VariableString
  : number

type Props<HasVariable extends boolean> = {
  defaultValue?: Value<HasVariable>
  debounceTimeout?: number
  withVariableButton?: HasVariable
  label?: string
  moreInfoTooltip?: string
  isRequired?: boolean
  onValueChange: (value?: Value<HasVariable>) => void
} & Omit<NumberInputProps, 'defaultValue' | 'value' | 'onChange' | 'isRequired'>

export const SmartNumberInput = <HasVariable extends boolean>({
  defaultValue,
  onValueChange,
  withVariableButton,
  debounceTimeout = 1000,
  label,
  moreInfoTooltip,
  isRequired,
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
    <NumberInput onChange={handleValueChange} value={value} {...props}>
      <NumberInputField placeholder={props.placeholder} />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  )

  return (
    <FormControl
      as={HStack}
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
