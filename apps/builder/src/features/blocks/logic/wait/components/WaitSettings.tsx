import { Stack, useToast } from '@chakra-ui/react'
import React from 'react'
import { TextInput } from '@/components/inputs'
import { WaitBlock } from '@typebot.io/schemas'

// Derive max wait seconds from env (client-side variable must be NEXT_PUBLIC_*)
const rawMax =
  process.env.NEXT_PUBLIC_WAIT_BLOCK_MAX_SECONDS ||
  process.env.WAIT_BLOCK_MAX_SECONDS ||
  '30'
const parsedMax = parseInt(rawMax, 10)
const MAX_WAIT_SECONDS =
  Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : 30

type Props = {
  options: WaitBlock['options']
  onOptionsChange: (options: WaitBlock['options']) => void
}

export const WaitSettings = ({ options, onOptionsChange }: Props) => {
  const toast = useToast()

  const handleSecondsChange = (value: string | undefined) => {
    if (!value) {
      onOptionsChange({ ...options, secondsToWaitFor: undefined })
      return
    }

    const parsed = parseFloat(value)

    if (isNaN(parsed)) return

    const clamped = Math.min(parsed, MAX_WAIT_SECONDS)

    if (parsed > MAX_WAIT_SECONDS) {
      toast({
        title: 'Maximum limit reached',
        description: `The maximum waiting time allowed is ${MAX_WAIT_SECONDS} seconds.`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
    }
    onOptionsChange({ ...options, secondsToWaitFor: clamped.toString() })
  }

  return (
    <Stack spacing={4}>
      <TextInput
        label={`Seconds to wait for (max ${MAX_WAIT_SECONDS}s):`}
        defaultValue={options?.secondsToWaitFor}
        onChange={handleSecondsChange}
      />
    </Stack>
  )
}
