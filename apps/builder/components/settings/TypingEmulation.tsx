import { Flex, Stack, Switch, Text } from '@chakra-ui/react'
import { TypingEmulationSettings } from 'bot-engine'
import React from 'react'
import { SmartNumberInput } from './SmartNumberInput'

type TypingEmulationProps = {
  typingEmulation?: TypingEmulationSettings
  onUpdate: (typingEmulation: TypingEmulationSettings) => void
}

export const TypingEmulation = ({
  typingEmulation,
  onUpdate,
}: TypingEmulationProps) => {
  const handleSwitchChange = () => {
    if (!typingEmulation) return
    onUpdate({ ...typingEmulation, enabled: !typingEmulation.enabled })
  }

  const handleSpeedChange = (speed: number) => {
    if (!typingEmulation) return
    onUpdate({ ...typingEmulation, speed })
  }

  const handleMaxDelayChange = (maxDelay: number) => {
    if (!typingEmulation) return
    onUpdate({ ...typingEmulation, maxDelay: maxDelay })
  }

  return (
    <Stack spacing={4}>
      <Flex justifyContent="space-between" align="center">
        <Text>Typing emulation</Text>
        <Switch
          isChecked={typingEmulation?.enabled}
          onChange={handleSwitchChange}
        />
      </Flex>
      {typingEmulation?.enabled && (
        <Stack pl={10}>
          <Flex justify="space-between" align="center">
            <Text>Words per minutes:</Text>
            <SmartNumberInput
              initialValue={typingEmulation.speed}
              onValueChange={handleSpeedChange}
              maxW="100px"
              step={30}
            />
          </Flex>
          <Flex justify="space-between" align="center">
            <Text>Max delay (in seconds):</Text>
            <SmartNumberInput
              initialValue={typingEmulation.maxDelay}
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
