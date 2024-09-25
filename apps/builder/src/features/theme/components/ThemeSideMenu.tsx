import { ChatIcon, CodeIcon, DropletIcon, TableIcon } from "@/components/icons";
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
import { useTranslate } from "@tolgee/react";
import { defaultSettings } from "@typebot.io/settings/constants";
import type {
  ChatTheme,
  GeneralTheme,
  ThemeTemplate,
} from "@typebot.io/theme/schemas";
import React from "react";
import { CustomCssSettings } from "./CustomCssSettings";
import { ThemeTemplates } from "./ThemeTemplates";
import { ChatThemeSettings } from "./chat/ChatThemeSettings";
import { GeneralSettings } from "./general/GeneralSettings";

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
      h="full"
      borderRightWidth={1}
      pt={10}
      spacing={10}
      overflowY="auto"
      pb="20"
      position="relative"
    >
      <Heading fontSize="xl" textAlign="center">
        {t("theme.sideMenu.title")}
      </Heading>
      <Accordion allowMultiple>
        {currentUserMode === "write" && (
          <AccordionItem>
            <AccordionButton py={6}>
              <HStack flex="1" pl={2}>
                <TableIcon />
                <Heading fontSize="lg">{t("theme.sideMenu.template")}</Heading>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={12}>
              {typebot && (
                <ThemeTemplates
                  selectedTemplateId={templateId}
                  currentTheme={typebot.theme}
                  workspaceId={typebot.workspaceId}
                  onTemplateSelect={selectTemplate}
                />
              )}
            </AccordionPanel>
          </AccordionItem>
        )}
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <DropletIcon />
              <Heading fontSize="lg">{t("theme.sideMenu.global")}</Heading>
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
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <ChatIcon />
              <Heading fontSize="lg">{t("theme.sideMenu.chat")}</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {typebot && (
              <ChatThemeSettings
                key={templateId}
                workspaceId={typebot.workspaceId}
                typebotId={typebot.id}
                chatTheme={typebot.theme.chat}
                generalBackground={typebot.theme.general?.background}
                onChatThemeChange={updateChatTheme}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <CodeIcon />
              <Heading fontSize="lg">{t("theme.sideMenu.customCSS")}</Heading>
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
