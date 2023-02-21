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
import { ChatIcon, CodeIcon, PencilIcon } from '@/components/icons'
import { ChatTheme, GeneralTheme } from 'models'
import React from 'react'
import { ChatThemeSettings } from './ChatSettings'
import { CustomCssSettings } from './CustomCssSettings/CustomCssSettings'
import { GeneralSettings } from './GeneralSettings'
import { headerHeight, useTypebot } from '@/features/editor'

export const ThemeSideMenu = () => {
  const { typebot, updateTypebot } = useTypebot()

  const handleChatThemeChange = (chat: ChatTheme) =>
    typebot && updateTypebot({ theme: { ...typebot.theme, chat } })

  const handleGeneralThemeChange = (general: GeneralTheme) =>
    typebot && updateTypebot({ theme: { ...typebot.theme, general } })

  const handleCustomCssChange = (customCss: string) =>
    typebot && updateTypebot({ theme: { ...typebot.theme, customCss } })

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
      position="relative"
    >
      <Heading fontSize="xl" textAlign="center">
        Customize the theme
      </Heading>
      <Accordion allowMultiple defaultIndex={[0]}>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <PencilIcon />
              <Heading fontSize="lg">General</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {typebot && (
              <GeneralSettings
                generalTheme={typebot.theme.general}
                onGeneralThemeChange={handleGeneralThemeChange}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <ChatIcon />
              <Heading fontSize="lg">Chat</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {typebot && (
              <ChatThemeSettings
                typebotId={typebot.id}
                chatTheme={typebot.theme.chat}
                onChatThemeChange={handleChatThemeChange}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <CodeIcon />
              <Heading fontSize="lg">Custom CSS</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {typebot && (
              <CustomCssSettings
                customCss={typebot.theme.customCss}
                onCustomCssChange={handleCustomCssChange}
              />
            )}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
