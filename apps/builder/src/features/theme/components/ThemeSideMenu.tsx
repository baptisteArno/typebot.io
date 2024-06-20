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
import { ChatIcon, CodeIcon, DropletIcon, TableIcon } from '@/components/icons'
import { ChatTheme, GeneralTheme, ThemeTemplate } from '@sniper.io/schemas'
import React from 'react'
import { CustomCssSettings } from './CustomCssSettings'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { ChatThemeSettings } from './chat/ChatThemeSettings'
import { GeneralSettings } from './general/GeneralSettings'
import { ThemeTemplates } from './ThemeTemplates'
import { defaultSettings } from '@sniper.io/schemas/features/sniper/settings/constants'
import { useTranslate } from '@tolgee/react'

export const ThemeSideMenu = () => {
  const { t } = useTranslate()

  const { sniper, updateSniper, currentUserMode } = useSniper()

  const updateChatTheme = (chat: ChatTheme) =>
    sniper && updateSniper({ updates: { theme: { ...sniper.theme, chat } } })

  const updateGeneralTheme = (general?: GeneralTheme) =>
    sniper && updateSniper({ updates: { theme: { ...sniper.theme, general } } })

  const updateCustomCss = (customCss: string) =>
    sniper &&
    updateSniper({ updates: { theme: { ...sniper.theme, customCss } } })

  const selectTemplate = (
    selectedTemplate: Partial<Pick<ThemeTemplate, 'id' | 'theme'>>
  ) => {
    if (!sniper) return
    const { theme, id } = selectedTemplate
    updateSniper({
      updates: {
        selectedThemeTemplateId: id,
        theme: theme ? { ...theme } : sniper.theme,
      },
    })
  }

  const updateBranding = (isBrandingEnabled: boolean) =>
    sniper &&
    updateSniper({
      updates: {
        settings: { ...sniper.settings, general: { isBrandingEnabled } },
      },
    })

  const templateId = sniper?.selectedThemeTemplateId ?? undefined

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
        {t('theme.sideMenu.title')}
      </Heading>
      <Accordion allowMultiple>
        {currentUserMode === 'write' && (
          <AccordionItem>
            <AccordionButton py={6}>
              <HStack flex="1" pl={2}>
                <TableIcon />
                <Heading fontSize="lg">{t('theme.sideMenu.template')}</Heading>
              </HStack>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={12}>
              {sniper && (
                <ThemeTemplates
                  selectedTemplateId={templateId}
                  currentTheme={sniper.theme}
                  workspaceId={sniper.workspaceId}
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
              <Heading fontSize="lg">{t('theme.sideMenu.global')}</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {sniper && (
              <GeneralSettings
                key={templateId}
                isBrandingEnabled={
                  sniper.settings.general?.isBrandingEnabled ??
                  defaultSettings.general.isBrandingEnabled
                }
                generalTheme={sniper.theme.general}
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
              <Heading fontSize="lg">{t('theme.sideMenu.chat')}</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {sniper && (
              <ChatThemeSettings
                key={templateId}
                workspaceId={sniper.workspaceId}
                sniperId={sniper.id}
                chatTheme={sniper.theme.chat}
                generalBackground={sniper.theme.general?.background}
                onChatThemeChange={updateChatTheme}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <CodeIcon />
              <Heading fontSize="lg">{t('theme.sideMenu.customCSS')}</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {sniper && (
              <CustomCssSettings
                key={templateId}
                customCss={sniper.theme.customCss}
                onCustomCssChange={updateCustomCss}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
