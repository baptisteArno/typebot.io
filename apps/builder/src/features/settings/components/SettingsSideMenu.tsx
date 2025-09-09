import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Heading,
  HStack,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { Settings } from "@typebot.io/settings/schemas";
import {
  ChatIcon,
  CodeIcon,
  LockedIcon,
  MoreVerticalIcon,
} from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { GeneralSettingsForm } from "./GeneralSettingsForm";
import { MetadataForm } from "./MetadataForm";
import { SecurityForm } from "./SecurityForm";
import { TypingEmulationForm } from "./TypingEmulationForm";

export const SettingsSideMenu = () => {
  const { typebot, updateTypebot } = useTypebot();
  const { t } = useTranslate();

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
      h={`calc(100% - 2rem)`}
      borderWidth={1}
      ml={4}
      overflowY="auto"
      pb="20"
      position="relative"
      rounded="xl"
      bg={useColorModeValue("white", "gray.900")}
    >
      <Accordion allowMultiple borderBottomWidth={0} defaultIndex={[0]}>
        <AccordionItem borderTopWidth={0}>
          <AccordionButton py={4}>
            <HStack flex="1" pl={2}>
              <MoreVerticalIcon transform={"rotate(90deg)"} />
              <Heading fontSize="md">{t("settings.sideMenu.general")}</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {typebot && (
              <GeneralSettingsForm
                generalSettings={typebot.settings.general}
                onGeneralSettingsChange={handleGeneralSettingsChange}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={4}>
            <HStack flex="1" pl={2}>
              <ChatIcon />
              <Heading fontSize="md">{t("settings.sideMenu.typing")}</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {typebot && (
              <TypingEmulationForm
                typingEmulation={typebot.settings.typingEmulation}
                onUpdate={updateTypingEmulation}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={4}>
            <HStack flex="1" pl={2}>
              <LockedIcon />
              <Heading fontSize="md">{t("settings.sideMenu.security")}</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            {typebot && (
              <SecurityForm
                security={typebot.settings.security}
                onUpdate={updateSecurity}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={4}>
            <HStack flex="1" pl={2}>
              <CodeIcon />
              <Heading fontSize="md">{t("settings.sideMenu.metadata")}</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
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
