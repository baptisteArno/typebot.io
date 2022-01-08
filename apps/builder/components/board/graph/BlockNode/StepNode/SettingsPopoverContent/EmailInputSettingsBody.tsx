import { FormLabel, Stack } from '@chakra-ui/react'
import { DebouncedInput } from 'components/shared/DebouncedInput'
import { EmailInputOptions } from 'models'
import React from 'react'

type EmailInputSettingsBodyProps = {
  options?: EmailInputOptions
  onOptionsChange: (options: EmailInputOptions) => void
}

export const EmailInputSettingsBody = ({
  options,
  onOptionsChange,
}: EmailInputSettingsBodyProps) => {
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, placeholder } })
  const handleButtonLabelChange = (button: string) =>
    onOptionsChange({ ...options, labels: { ...options?.labels, button } })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Placeholder:
        </FormLabel>
        <DebouncedInput
          id="placeholder"
          initialValue={options?.labels?.placeholder ?? 'Type your email...'}
          delay={100}
          onChange={handlePlaceholderChange}
        />
      </Stack>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Button label:
        </FormLabel>
        <DebouncedInput
          id="button"
          initialValue={options?.labels?.button ?? 'Send'}
          delay={100}
          onChange={handleButtonLabelChange}
        />
      </Stack>
    </Stack>
  )
}
