import { FormLabel, Stack } from '@chakra-ui/react'
import { Input } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput'
import { PhoneNumberInputOptions, Variable } from 'models'
import React from 'react'
import { CountryCodeSelect } from './CountryCodeSelect'

type PhoneNumberSettingsBodyProps = {
  options: PhoneNumberInputOptions
  onOptionsChange: (options: PhoneNumberInputOptions) => void
}

export const PhoneNumberSettingsBody = ({
  options,
  onOptionsChange,
}: PhoneNumberSettingsBodyProps) => {
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options.labels, placeholder } })
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options.labels, button } })
  const handleVariableChange = (variable?: Variable) =>
    onOptionsChange({ ...options, variableId: variable?.id })
  const handleRetryMessageChange = (retryMessageContent: string) =>
    onOptionsChange({ ...options, retryMessageContent })
  const handleDefaultCountryChange = (defaultCountryCode: string) =>
    onOptionsChange({ ...options, defaultCountryCode })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Placeholder:
        </FormLabel>
        <Input
          id="placeholder"
          defaultValue={options.labels.placeholder}
          onChange={handlePlaceholderChange}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Mensagem do botão:
        </FormLabel>
        <Input
          id="button"
          defaultValue={options.labels.button}
          onChange={handleButtonLabelChange}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          País padrão:
        </FormLabel>
        <CountryCodeSelect
          onSelect={handleDefaultCountryChange}
          countryCode={options.defaultCountryCode}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="retry">
          Mensagem de retentativa:
        </FormLabel>
        <Input
          id="retry"
          defaultValue={options.retryMessageContent}
          onChange={handleRetryMessageChange}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="variable">
          Salvar resposta em uma variável:
        </FormLabel>
        <VariableSearchInput
          initialVariableId={options.variableId}
          onSelectVariable={handleVariableChange}
        />
      </Stack>
    </Stack>
  )
}
