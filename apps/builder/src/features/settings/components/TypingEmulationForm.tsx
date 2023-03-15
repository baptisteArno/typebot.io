import { Flex, FormLabel, Stack, Switch } from '@chakra-ui/react'
import { TypingEmulation } from '@typebot.io/schemas'
import React from 'react'
import { isDefined } from '@typebot.io/lib'
import { NumberInput } from '@/components/inputs'

type Props = {
  typingEmulation: TypingEmulation
  onUpdate: (typingEmulation: TypingEmulation) => void
}

export const TypingEmulationForm = ({ typingEmulation, onUpdate }: Props) => {
  const handleSwitchChange = () =>
    onUpdate({
      ...typingEmulation,
      enabled: !typingEmulation.enabled,
    })

  const handleSpeedChange = (speed?: number) =>
    isDefined(speed) && onUpdate({ ...typingEmulation, speed })

  const handleMaxDelayChange = (maxDelay?: number) =>
    isDefined(maxDelay) && onUpdate({ ...typingEmulation, maxDelay })

  return (
    <Stack spacing={6}>
      <Flex justifyContent="space-between" align="center">
        <FormLabel htmlFor="typing-emulation" mb="0">
          Typing emulation
        </FormLabel>
        <Switch
          id="typing-emulation"
          isChecked={typingEmulation.enabled}
          onChange={handleSwitchChange}
        />
      </Flex>
      {typingEmulation.enabled && (
        <Stack pl={10}>
          <NumberInput
            label="Words per minutes:"
            data-testid="speed"
            defaultValue={typingEmulation.speed}
            onValueChange={handleSpeedChange}
            withVariableButton={false}
            maxW="100px"
            step={30}
          />
          <NumberInput
            label="Max delay (in seconds):"
            data-testid="max-delay"
            defaultValue={typingEmulation.maxDelay}
            onValueChange={handleMaxDelayChange}
            withVariableButton={false}
            maxW="100px"
            step={0.1}
          />
        </Stack>
      )}
    </Stack>
  )
}
