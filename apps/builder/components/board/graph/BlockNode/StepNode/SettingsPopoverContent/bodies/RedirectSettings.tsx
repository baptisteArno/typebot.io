import { FormLabel, Stack } from '@chakra-ui/react'
import { DebouncedInput } from 'components/shared/DebouncedInput'
import { SwitchWithLabel } from 'components/shared/SwitchWithLabel'
import { RedirectOptions } from 'models'
import React from 'react'

type Props = {
  options: RedirectOptions
  onOptionsChange: (options: RedirectOptions) => void
}

export const RedirectSettings = ({ options, onOptionsChange }: Props) => {
  const handleUrlChange = (url?: string) => onOptionsChange({ ...options, url })

  const handleIsNewTabChange = (isNewTab: boolean) =>
    onOptionsChange({ ...options, isNewTab })

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="tracking-id">
          Url:
        </FormLabel>
        <DebouncedInput
          id="tracking-id"
          initialValue={options.url ?? ''}
          placeholder="Type a URL..."
          delay={100}
          onChange={handleUrlChange}
        />
      </Stack>
      <SwitchWithLabel
        id="new-tab"
        label="Open in new tab?"
        initialValue={options.isNewTab}
        onCheckChange={handleIsNewTabChange}
      />
    </Stack>
  )
}
