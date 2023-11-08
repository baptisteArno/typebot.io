import { TextInput } from '@/components/inputs'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { FormLabel, Stack } from '@chakra-ui/react'
import { PhoneNumberInputBlock, Variable } from '@typebot.io/schemas'
import React from 'react'
import { CountryCodeSelect } from './CountryCodeSelect'
import { defaultPhoneInputOptions } from '@typebot.io/schemas/features/blocks/inputs/phone/constants'

type Props = {
  options: PhoneNumberInputBlock['options']
  onOptionsChange: (options: PhoneNumberInputBlock['options']) => void
}

export const PhoneInputSettings = ({ options, onOptionsChange }: Props) => {
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const handleRetryMessageChange = (retryMessageContent: string) =>
    onOptionsChange({ ...options, retryMessageContent })
  const handleDefaultCountryChange = (defaultCountryCode: string) =>
    onOptionsChange({ ...options, defaultCountryCode })

  return (
    <Stack spacing={4}>
      <TextInput
        label="Placeholder:"
        defaultValue={
          options?.labels?.placeholder ??
          defaultPhoneInputOptions.labels.placeholder
        }
        onChange={handlePlaceholderChange}
      />
      <TextInput
        label="Button label:"
        defaultValue={
          options?.labels?.button ?? defaultPhoneInputOptions.labels.button
        }
        onChange={handleButtonLabelChange}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Default country:
        </FormLabel>
        <CountryCodeSelect
          onSelect={handleDefaultCountryChange}
          countryCode={options?.defaultCountryCode}
        />
      </Stack>
      <TextInput
        label="Retry message:"
        defaultValue={
          options?.retryMessageContent ??
          defaultPhoneInputOptions.retryMessageContent
        }
        onChange={handleRetryMessageChange}
      />
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          Save answer in a variable:
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options?.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
