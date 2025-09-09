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
import { defaultSettings } from "@typebot.io/settings/constants";
import type {
  ChatTheme,
  GeneralTheme,
  ThemeTemplate,
} from "@typebot.io/theme/schemas";
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
      <Accordion allowToggle borderBottomWidth={0}>
        {currentUserMode === "write" && (
          <AccordionItem borderTopWidth={0}>
            <AccordionButton py={4}>
              <HStack flex="1" pl={2} spacing={3}>
                <TableIcon />
                <Heading fontSize="md">{t("theme.sideMenu.template")}</Heading>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              {typebot && (
                <ThemeTemplates
                  selectedTemplateId={templateId}
                  typebotVersion={typebot.version}
                  currentTheme={typebot.theme}
                  workspaceId={typebot.workspaceId}
                  onTemplateSelect={selectTemplate}
                />
              )}
            </AccordionPanel>
          </AccordionItem>
        )}
        <AccordionItem>
          <AccordionButton py={4}>
            <HStack flex="1" pl={2} spacing={3}>
              <DropletIcon />
              <Heading fontSize="md">{t("theme.sideMenu.global")}</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
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
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={4}>
            <HStack flex="1" pl={2} spacing={3}>
              <ChatIcon />
              <Heading fontSize="md">{t("theme.sideMenu.chat")}</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
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
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem _last={{ borderBottomWidth: 0 }}>
          <AccordionButton py={4}>
            <HStack flex="1" pl={2} spacing={3}>
              <CodeIcon />
              <Heading fontSize="md">{t("theme.sideMenu.customCSS")}</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {typebot && (
              <CustomCssSettings
                key={templateId}
                customCss={typebot.theme.customCss}
                onCustomCssChange={updateCustomCss}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  );
};
