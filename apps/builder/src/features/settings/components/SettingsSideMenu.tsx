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
import {
  ChatIcon,
  CodeIcon,
  LockedIcon,
  MoreVerticalIcon,
} from '@/components/icons'
import { Settings } from '@sniper.io/schemas'
import React from 'react'
import { GeneralSettingsForm } from './GeneralSettingsForm'
import { MetadataForm } from './MetadataForm'
import { TypingEmulationForm } from './TypingEmulationForm'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { SecurityForm } from './SecurityForm'

export const SettingsSideMenu = () => {
  const { sniper, updateSniper } = useSniper()

  const updateTypingEmulation = (
    typingEmulation: Settings['typingEmulation']
  ) =>
    sniper &&
    updateSniper({
      updates: { settings: { ...sniper.settings, typingEmulation } },
    })

  const updateSecurity = (security: Settings['security']) =>
    sniper &&
    updateSniper({
      updates: { settings: { ...sniper.settings, security } },
    })

  const handleGeneralSettingsChange = (general: Settings['general']) =>
    sniper &&
    updateSniper({ updates: { settings: { ...sniper.settings, general } } })

  const handleMetadataChange = (metadata: Settings['metadata']) =>
    sniper &&
    updateSniper({ updates: { settings: { ...sniper.settings, metadata } } })

  return (
    <Stack
      flex="1"
      maxW="400px"
      height="full"
      borderRightWidth={1}
      pt={10}
      spacing={10}
      overflowY="auto"
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
            {sniper && (
              <GeneralSettingsForm
                generalSettings={sniper.settings.general}
                onGeneralSettingsChange={handleGeneralSettingsChange}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <ChatIcon />
              <Heading fontSize="lg">Typing</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} px="6">
            {sniper && (
              <TypingEmulationForm
                typingEmulation={sniper.settings.typingEmulation}
                onUpdate={updateTypingEmulation}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <LockedIcon />
              <Heading fontSize="lg">Security</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} px="6">
            {sniper && (
              <SecurityForm
                security={sniper.settings.security}
                onUpdate={updateSecurity}
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
            {sniper && (
              <MetadataForm
                workspaceId={sniper.workspaceId}
                sniperId={sniper.id}
                sniperName={sniper.name}
                metadata={sniper.settings.metadata}
                onMetadataChange={handleMetadataChange}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
