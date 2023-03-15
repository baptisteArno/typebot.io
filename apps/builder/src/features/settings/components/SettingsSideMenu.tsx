import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Heading,
  HStack,
  Stack,
} from '@chakra-ui/react'
import { ChatIcon, CodeIcon, MoreVerticalIcon } from '@/components/icons'
import { GeneralSettings, Metadata, TypingEmulation } from '@typebot.io/schemas'
import React from 'react'
import { GeneralSettingsForm } from './GeneralSettingsForm'
import { MetadataForm } from './MetadataForm'
import { TypingEmulationForm } from './TypingEmulationForm'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { headerHeight } from '@/features/editor/constants'

export const SettingsSideMenu = () => {
  const { typebot, updateTypebot } = useTypebot()

  const handleTypingEmulationChange = (typingEmulation: TypingEmulation) =>
    typebot &&
    updateTypebot({ settings: { ...typebot.settings, typingEmulation } })

  const handleGeneralSettingsChange = (general: GeneralSettings) =>
    typebot && updateTypebot({ settings: { ...typebot.settings, general } })

  const handleMetadataChange = (metadata: Metadata) =>
    typebot && updateTypebot({ settings: { ...typebot.settings, metadata } })

  return (
    <Stack
      flex="1"
      maxW="400px"
      height={`calc(100vh - ${headerHeight}px)`}
      borderRightWidth={1}
      pt={10}
      spacing={10}
      overflowY="scroll"
      pb="20"
    >
      <Heading fontSize="xl" textAlign="center">
        Settings
      </Heading>
      <Accordion allowMultiple defaultIndex={[0]}>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <MoreVerticalIcon transform={'rotate(90deg)'} />
              <Heading fontSize="lg">General</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} px="6">
            {typebot && (
              <GeneralSettingsForm
                generalSettings={typebot.settings.general}
                onGeneralSettingsChange={handleGeneralSettingsChange}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <ChatIcon />
              <Heading fontSize="lg">Typing emulation</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} px="6">
            {typebot && (
              <TypingEmulationForm
                typingEmulation={typebot.settings.typingEmulation}
                onUpdate={handleTypingEmulationChange}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <CodeIcon />
              <Heading fontSize="lg">Metadata</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} px="6">
            {typebot && (
              <MetadataForm
                typebotId={typebot.id}
                typebotName={typebot.name}
                metadata={typebot.settings.metadata}
                onMetadataChange={handleMetadataChange}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
