import { Stack } from '@chakra-ui/react'
import React from 'react'
import { isDefined } from '@typebot.io/lib'
import { AbTestBlock } from '@typebot.io/schemas'
import { NumberInput } from '@/components/inputs'

type Props = {
  options: AbTestBlock['options']
  onOptionsChange: (options: AbTestBlock['options']) => void
}

export const AbTestSettings = ({ options, onOptionsChange }: Props) => {
  const updateAPercent = (aPercent?: number) =>
    isDefined(aPercent) ? onOptionsChange({ ...options, aPercent }) : null

  return (
    <Stack spacing={4}>
      <NumberInput
        defaultValue={options.aPercent}
        onValueChange={updateAPercent}
        withVariableButton={false}
        label="Percent of users to follow A:"
        direction="column"
        max={100}
        min={0}
      />
    </Stack>
  )
}
