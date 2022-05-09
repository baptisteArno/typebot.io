import { FormLabel, Stack } from '@chakra-ui/react'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { Input } from 'components/shared/Textbox'
import { VariableSearchInput } from 'components/shared/VariableSearchInput'
import { EndConversationOptions, Variable } from 'models'
import React from 'react'

type EndConversationSettingsBodyProps = {
  options: EndConversationOptions
  onOptionsChange: (options: EndConversationOptions) => void
}

export const EndConversationSettingsBody = ({
  options,
  onOptionsChange,
}: EndConversationSettingsBodyProps) => {
  const handlePlaceholderChange = (placeholder: string) =>
    onOptionsChange({ ...options, labels: { ...options.labels, placeholder } })

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
    </Stack>
  )
}
