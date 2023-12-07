import { Stack } from '@chakra-ui/react'
import { Settings } from '@typebot.io/schemas'
import React from 'react'
import { isDefined } from '@typebot.io/lib'
import { NumberInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { defaultSettings } from '@typebot.io/schemas/features/typebot/settings/constants'

type Props = {
  typingEmulation: Settings['typingEmulation']
  onUpdate: (typingEmulation: Settings['typingEmulation']) => void
}

export const TypingEmulationForm = ({ typingEmulation, onUpdate }: Props) => {
  const updateIsEnabled = (enabled: boolean) =>
    onUpdate({
      ...typingEmulation,
      enabled,
    })

  const handleSpeedChange = (speed?: number) =>
    isDefined(speed) && onUpdate({ ...typingEmulation, speed })

  const handleMaxDelayChange = (maxDelay?: number) =>
    isDefined(maxDelay) && onUpdate({ ...typingEmulation, maxDelay })

  const isEnabled =
    typingEmulation?.enabled ?? defaultSettings.typingEmulation.enabled

  return (
    <Stack spacing={6}>
      <SwitchWithLabel
        label={'Typing emulation'}
        initialValue={isEnabled}
        onCheckChange={updateIsEnabled}
      />
      {isEnabled && (
        <Stack pl={10}>
          <NumberInput
            label="Words per minutes:"
            data-testid="speed"
            defaultValue={
              typingEmulation?.speed ?? defaultSettings.typingEmulation.speed
            }
            onValueChange={handleSpeedChange}
            withVariableButton={false}
            maxW="100px"
            step={30}
            direction="row"
          />
          <NumberInput
            label="Max delay (in seconds):"
            data-testid="max-delay"
            defaultValue={
              typingEmulation?.maxDelay ??
              defaultSettings.typingEmulation.maxDelay
            }
            onValueChange={handleMaxDelayChange}
            withVariableButton={false}
            maxW="100px"
            step={0.1}
            direction="row"
          />
        </Stack>
      )}
    </Stack>
  )
}
