import { Stack } from '@chakra-ui/react'
import { WaitOptions } from 'models'
import React from 'react'
import { Input } from '@/components/inputs'

type Props = {
  options: WaitOptions
  onOptionsChange: (options: WaitOptions) => void
}

export const WaitSettings = ({ options, onOptionsChange }: Props) => {
  const handleSecondsChange = (secondsToWaitFor: string | undefined) => {
    onOptionsChange({ ...options, secondsToWaitFor })
  }

  return (
    <Stack spacing={4}>
      <Input
        label="Seconds to wait for:"
        defaultValue={options.secondsToWaitFor}
        onChange={handleSecondsChange}
        placeholder="0"
      />
    </Stack>
  )
}
