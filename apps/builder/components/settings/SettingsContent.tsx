import { Flex, Stack } from '@chakra-ui/react'
import { TypingEmulationSettings } from 'models'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React from 'react'
import { TypingEmulation } from './TypingEmulation'

export const SettingsContent = () => {
  const { typebot, updateTypebot } = useTypebot()

  const handleTypingEmulationUpdate = (
    typingEmulation: TypingEmulationSettings
  ) => {
    if (!typebot) return
    updateTypebot({ settings: { ...typebot.settings, typingEmulation } })
  }
  return (
    <Flex h="full" w="full" justifyContent="center" align="flex-start">
      <Stack p="6" rounded="md" borderWidth={1} w="600px" minH="500px" mt={10}>
        <TypingEmulation
          typingEmulation={typebot?.settings.typingEmulation}
          onUpdate={handleTypingEmulationUpdate}
        />
      </Stack>
    </Flex>
  )
}
