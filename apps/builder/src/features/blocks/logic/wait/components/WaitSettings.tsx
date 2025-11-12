import { Stack, useToast } from '@chakra-ui/react'
import React from 'react'
import { TextInput } from '@/components/inputs'
import { WaitBlock } from '@typebot.io/schemas'
import { useTranslate } from '@tolgee/react'

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
  const { t } = useTranslate()

  const handleSecondsChange = (value: string | undefined) => {
    if (!value) {
      onOptionsChange({ ...options, secondsToWaitFor: undefined })
      return
    }

    const trimmed = value.trim()

    if (
      trimmed.startsWith('{{') &&
      trimmed.endsWith('}}') &&
      trimmed.slice(2, -2).trim().length > 0
    ) {
      const varName = trimmed.slice(2, -2).trim()
      if (varName.length === 0) return
      onOptionsChange({ ...options, secondsToWaitFor: trimmed })
      return
    }

    const parsed = parseFloat(trimmed)
    if (isNaN(parsed)) return

    const clamped = Math.min(parsed, MAX_WAIT_SECONDS)

    if (parsed > MAX_WAIT_SECONDS) {
      toast({
        title: t('blocks.logic.wait.settings.toast.maxReached.title'),
        description: t(
          'blocks.logic.wait.settings.toast.maxReached.description',
          { max: MAX_WAIT_SECONDS }
        ),
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
        label={t('blocks.logic.wait.settings.input.label', {
          max: MAX_WAIT_SECONDS,
        })}
        defaultValue={options?.secondsToWaitFor}
        onChange={handleSecondsChange}
      />
    </Stack>
  )
}
