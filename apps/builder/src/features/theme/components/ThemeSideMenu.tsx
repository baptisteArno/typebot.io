import { Heading, Stack, useColorModeValue } from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import { defaultSettings } from "@typebot.io/settings/constants";
import type {
  ChatTheme,
  GeneralTheme,
  ThemeTemplate,
} from "@typebot.io/theme/schemas";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { ChatIcon, CodeIcon, DropletIcon, TableIcon } from "@/components/icons";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { CustomCssSettings } from "./CustomCssSettings";
import { ChatThemeSettings } from "./chat/ChatThemeSettings";
import { GeneralSettings } from "./general/GeneralSettings";
import { ThemeTemplates } from "./ThemeTemplates";

export const ThemeSideMenu = () => {
  const { t } = useTranslate();

  const { typebot, updateTypebot, currentUserMode } = useTypebot();

  const updateChatTheme = (chat: ChatTheme) =>
    typebot &&
    updateTypebot({ updates: { theme: { ...typebot.theme, chat } } });

  const updateGeneralTheme = (general?: GeneralTheme) =>
    typebot &&
    updateTypebot({ updates: { theme: { ...typebot.theme, general } } });

  const updateCustomCss = (customCss: string) =>
    typebot &&
    updateTypebot({ updates: { theme: { ...typebot.theme, customCss } } });

  const selectTemplate = (
    selectedTemplate: Partial<Pick<ThemeTemplate, "id" | "theme">>,
  ) => {
    if (!typebot) return;
    const { theme, id } = selectedTemplate;
    updateTypebot({
      updates: {
        selectedThemeTemplateId: id,
        theme: theme ? { ...theme } : typebot.theme,
      },
    });
  };

  const updateBranding = (isBrandingEnabled: boolean) =>
    typebot &&
    updateTypebot({
      updates: {
        settings: { ...typebot.settings, general: { isBrandingEnabled } },
      },
    });

  const templateId = typebot?.selectedThemeTemplateId ?? undefined;

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
        {currentUserMode === "write" && (
          <Accordion.Item className="border-0">
            <Accordion.Trigger className="py-5">
              <div className="flex items-center gap-3 pl-2">
                <TableIcon />
                <Heading fontSize="md">{t("theme.sideMenu.template")}</Heading>
              </div>
            </Accordion.Trigger>
            <Accordion.Panel>
              {typebot && (
                <ThemeTemplates
                  selectedTemplateId={templateId}
                  typebotVersion={typebot.version}
                  currentTheme={typebot.theme}
                  workspaceId={typebot.workspaceId}
                  onTemplateSelect={selectTemplate}
                />
              )}
            </Accordion.Panel>
          </Accordion.Item>
        )}
        <Accordion.Item className="border-0 border-t-[1px]">
          <Accordion.Trigger className="py-5">
            <div className="flex items-center gap-3 pl-2">
              <DropletIcon />
              <Heading fontSize="md">{t("theme.sideMenu.global")}</Heading>
            </div>
          </Accordion.Trigger>
          <Accordion.Panel>
            {typebot && (
              <GeneralSettings
                key={templateId}
                isBrandingEnabled={
                  typebot.settings.general?.isBrandingEnabled ??
                  defaultSettings.general.isBrandingEnabled
                }
                generalTheme={typebot.theme.general}
                onGeneralThemeChange={updateGeneralTheme}
                onBrandingChange={updateBranding}
              />
            )}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item className="border-0 border-t-[1px]">
          <Accordion.Trigger className="py-5">
            <div className="flex items-center gap-3 pl-2">
              <ChatIcon />
              <Heading fontSize="md">{t("theme.sideMenu.chat")}</Heading>
            </div>
          </Accordion.Trigger>
          <Accordion.Panel>
            {typebot && (
              <ChatThemeSettings
                key={templateId}
                workspaceId={typebot.workspaceId}
                typebot={typebot}
                chatTheme={typebot.theme.chat}
                generalBackground={typebot.theme.general?.background}
                onChatThemeChange={updateChatTheme}
              />
            )}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item className="border-0 border-t-[1px] last:rounded-b-none">
          <Accordion.Trigger className="py-5">
            <div className="flex items-center gap-3 pl-2">
              <CodeIcon />
              <Heading fontSize="md">{t("theme.sideMenu.customCSS")}</Heading>
            </div>
          </Accordion.Trigger>
          <Accordion.Panel>
            {typebot && (
              <CustomCssSettings
                key={templateId}
                customCss={typebot.theme.customCss}
                onCustomCssChange={updateCustomCss}
              />
            )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
};
