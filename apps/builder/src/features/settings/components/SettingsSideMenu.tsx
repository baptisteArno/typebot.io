import {
  ChatIcon,
  CodeIcon,
  LockedIcon,
  MoreVerticalIcon,
} from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Heading,
  Stack,
} from "@chakra-ui/react";
import type { Settings } from "@typebot.io/settings/schemas";
import React from "react";
import { GeneralSettingsForm } from "./GeneralSettingsForm";
import { MetadataForm } from "./MetadataForm";
import { SecurityForm } from "./SecurityForm";
import { TypingEmulationForm } from "./TypingEmulationForm";

export const SettingsSideMenu = () => {
  const { typebot, updateTypebot } = useTypebot();

  const updateTypingEmulation = (
    typingEmulation: Settings["typingEmulation"],
  ) =>
    typebot &&
    updateTypebot({
      updates: { settings: { ...typebot.settings, typingEmulation } },
    });

  const updateSecurity = (security: Settings["security"]) =>
    typebot &&
    updateTypebot({
      updates: { settings: { ...typebot.settings, security } },
    });

  const handleGeneralSettingsChange = (general: Settings["general"]) =>
    typebot &&
    updateTypebot({ updates: { settings: { ...typebot.settings, general } } });

  const handleMetadataChange = (metadata: Settings["metadata"]) =>
    typebot &&
    updateTypebot({ updates: { settings: { ...typebot.settings, metadata } } });

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
              <MoreVerticalIcon transform={"rotate(90deg)"} />
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
              <Heading fontSize="lg">Typing</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} px="6">
            {typebot && (
              <TypingEmulationForm
                typingEmulation={typebot.settings.typingEmulation}
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
            {typebot && (
              <SecurityForm
                security={typebot.settings.security}
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
            {typebot && (
              <MetadataForm
                workspaceId={typebot.workspaceId}
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
  );
};
