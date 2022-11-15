import { Flex, FormLabel, Stack, Switch } from '@chakra-ui/react'
import { TypingEmulation } from 'models'
import React from 'react'
import { isDefined } from 'utils'
import { SmartNumberInput } from '@/components/inputs'

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
          <Flex justify="space-between" align="center">
            <FormLabel htmlFor="speed" mb="0">
              Words per minutes:
            </FormLabel>
            <SmartNumberInput
              id="speed"
              data-testid="speed"
              value={typingEmulation.speed}
              onValueChange={handleSpeedChange}
              maxW="100px"
              step={30}
            />
          </Flex>
          <Flex justify="space-between" align="center">
            <FormLabel htmlFor="max-delay" mb="0">
              Max delay (in seconds):
            </FormLabel>
            <SmartNumberInput
              id="max-delay"
              data-testid="max-delay"
              value={typingEmulation.maxDelay}
              onValueChange={handleMaxDelayChange}
              maxW="100px"
              step={0.1}
            />
          </Flex>
        </Stack>
      )}
    </Stack>
  )
}
