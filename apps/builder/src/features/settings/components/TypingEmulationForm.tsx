import { HStack, Stack, Text } from '@chakra-ui/react'
import { Settings } from '@typebot.io/schemas'
import React from 'react'
import { NumberInput } from '@/components/inputs'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { defaultSettings } from '@typebot.io/schemas/features/typebot/settings/constants'
import { SwitchWithRelatedSettings } from '@/components/SwitchWithRelatedSettings'
import { isDefined } from '@typebot.io/lib'

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

  const updateSpeed = (speed?: number) =>
    onUpdate({ ...typingEmulation, speed })

  const updateMaxDelay = (maxDelay?: number) =>
    onUpdate({
      ...typingEmulation,
      maxDelay: isDefined(maxDelay)
        ? Math.max(Math.min(maxDelay, 5), 0)
        : undefined,
    })

  const updateIsDisabledOnFirstMessage = (isDisabledOnFirstMessage: boolean) =>
    onUpdate({
      ...typingEmulation,
      isDisabledOnFirstMessage,
    })

  const updateDelayBetweenBubbles = (delayBetweenBubbles?: number) =>
    onUpdate({ ...typingEmulation, delayBetweenBubbles })

  return (
    <Stack spacing={6}>
      <SwitchWithRelatedSettings
        label={'Typing emulation'}
        initialValue={
          typingEmulation?.enabled ?? defaultSettings.typingEmulation.enabled
        }
        onCheckChange={updateIsEnabled}
      >
        <NumberInput
          label="Words per minutes:"
          data-testid="speed"
          defaultValue={
            typingEmulation?.speed ?? defaultSettings.typingEmulation.speed
          }
          onValueChange={updateSpeed}
          withVariableButton={false}
          maxW="100px"
          step={30}
          direction="row"
        />
        <HStack>
          <NumberInput
            label="Max delay:"
            data-testid="max-delay"
            defaultValue={
              typingEmulation?.maxDelay ??
              defaultSettings.typingEmulation.maxDelay
            }
            onValueChange={updateMaxDelay}
            withVariableButton={false}
            maxW="100px"
            step={0.1}
            direction="row"
            size="sm"
          />
          <Text>seconds</Text>
        </HStack>

        <SwitchWithLabel
          label={'Disable on first message'}
          moreInfoContent="When checked, typing emulation will be disabled for the first message sent by the bot."
          onCheckChange={updateIsDisabledOnFirstMessage}
          initialValue={
            typingEmulation?.isDisabledOnFirstMessage ??
            defaultSettings.typingEmulation.isDisabledOnFirstMessage
          }
        />
      </SwitchWithRelatedSettings>
      <HStack>
        <NumberInput
          label="Delay between messages:"
          defaultValue={
            typingEmulation?.delayBetweenBubbles ??
            defaultSettings.typingEmulation.delayBetweenBubbles
          }
          withVariableButton={false}
          onValueChange={updateDelayBetweenBubbles}
          direction="row"
          maxW={'100px'}
          min={0}
          max={5}
          size="sm"
        />
        <Text>seconds</Text>
      </HStack>
    </Stack>
  )
}
