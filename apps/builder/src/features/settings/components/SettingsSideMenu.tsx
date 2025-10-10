import { Heading, Stack, useColorModeValue } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import type { Settings } from "@typebot.io/settings/schemas";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import {
  ChatIcon,
  CodeIcon,
  LockedIcon,
  MoreHorizontalIcon,
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
      <Accordion.Root>
        <Accordion.Item className="border-0">
          <Accordion.Trigger className="py-5">
            <div className="flex items-center gap-3 pl-2">
              <MoreHorizontalIcon />
              <Heading fontSize="md">{t("settings.sideMenu.general")}</Heading>
            </div>
          </Accordion.Trigger>
          <Accordion.Panel>
            {typebot && (
              <GeneralSettingsForm
                generalSettings={typebot.settings.general}
                onGeneralSettingsChange={handleGeneralSettingsChange}
              />
            )}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item className="border-0 border-t-[1px]">
          <Accordion.Trigger className="py-5">
            <div className="flex items-center gap-3 pl-2">
              <ChatIcon />
              <Heading fontSize="md">{t("settings.sideMenu.typing")}</Heading>
            </div>
          </Accordion.Trigger>
          <Accordion.Panel>
            {typebot && (
              <TypingEmulationForm
                typingEmulation={typebot.settings.typingEmulation}
                onUpdate={updateTypingEmulation}
              />
            )}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item className="border-0 border-t-[1px]">
          <Accordion.Trigger className="py-5">
            <div className="flex items-center gap-3 pl-2">
              <LockedIcon />
              <Heading fontSize="md">{t("settings.sideMenu.security")}</Heading>
            </div>
          </Accordion.Trigger>
          <Accordion.Panel>
            {typebot && (
              <SecurityForm
                security={typebot.settings.security}
                onUpdate={updateSecurity}
              />
            )}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item className="border-0 border-t-[1px] last:rounded-b-none">
          <Accordion.Trigger className="py-5">
            <div className="flex items-center gap-3 pl-2">
              <CodeIcon />
              <Heading fontSize="md">{t("settings.sideMenu.metadata")}</Heading>
            </div>
          </Accordion.Trigger>
          <Accordion.Panel>
            {typebot && (
              <MetadataForm
                workspaceId={typebot.workspaceId}
                typebotId={typebot.id}
                typebotName={typebot.name}
                metadata={typebot.settings.metadata}
                onMetadataChange={handleMetadataChange}
              />
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
};
