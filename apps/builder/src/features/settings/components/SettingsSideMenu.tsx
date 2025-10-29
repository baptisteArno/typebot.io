import { useTranslate } from "@tolgee/react";
import type { Settings } from "@typebot.io/settings/schemas";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { ChatIcon } from "@typebot.io/ui/icons/ChatIcon";
import { MoreHorizontalIcon } from "@typebot.io/ui/icons/MoreHorizontalIcon";
import { SourceCodeIcon } from "@typebot.io/ui/icons/SourceCodeIcon";
import { SquareLock01Icon } from "@typebot.io/ui/icons/SquareLock01Icon";
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
    <div className="flex flex-col gap-2 flex-1 max-w-[400px] border ml-4 overflow-y-auto pb-20 relative rounded-xl h-[calc(100%-2rem)] bg-gray-1 dark:bg-gray-2">
      <Accordion.Root>
        <Accordion.Item className="border-0">
          <Accordion.Trigger className="py-5">
            <div className="flex items-center gap-3 pl-2">
              <MoreHorizontalIcon />
              <h3 className="text-lg">{t("settings.sideMenu.general")}</h3>
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
        <Accordion.Item className="border-0 border-t">
          <Accordion.Trigger className="py-5">
            <div className="flex items-center gap-3 pl-2">
              <ChatIcon />
              <h3 className="text-lg">{t("settings.sideMenu.typing")}</h3>
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
        <Accordion.Item className="border-0 border-t">
          <Accordion.Trigger className="py-5">
            <div className="flex items-center gap-3 pl-2">
              <SquareLock01Icon />
              <h3 className="text-lg">{t("settings.sideMenu.security")}</h3>
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
        <Accordion.Item className="border-0 border-t last:rounded-b-none">
          <Accordion.Trigger className="py-5">
            <div className="flex items-center gap-3 pl-2">
              <SourceCodeIcon />
              <h3 className="text-lg">{t("settings.sideMenu.metadata")}</h3>
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
    </div>
  );
};
