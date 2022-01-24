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
import { ChatIcon, CodeIcon, LayoutIcon, PencilIcon } from 'assets/icons'
import { headerHeight } from 'components/shared/TypebotHeader'
import { useTypebot } from 'contexts/TypebotContext'
import { ChatTheme, GeneralTheme } from 'models'
import React from 'react'
import { ChatThemeSettings } from './ChatSettings'
import { GeneralSettings } from './GeneralSettings'

export const SideMenu = () => {
  const { typebot, updateTypebot } = useTypebot()

  const handleChatThemeChange = (chat: ChatTheme) =>
    updateTypebot({ theme: { ...typebot?.theme, chat } })

  const handleGeneralThemeChange = (general: GeneralTheme) =>
    updateTypebot({ theme: { ...typebot?.theme, general } })

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
    >
      <Heading fontSize="xl" textAlign="center">
        Customize the theme
      </Heading>
      <Accordion allowMultiple allowToggle>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <PencilIcon />
              <Heading fontSize="lg">General</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <GeneralSettings
              generalTheme={typebot?.theme?.general}
              onGeneralThemeChange={handleGeneralThemeChange}
            />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem>
          <AccordionButton py={6}>
            <HStack flex="1" pl={2}>
              <LayoutIcon />
              <Heading fontSize="lg">Layout</Heading>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
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
            <ChatThemeSettings
              chatTheme={typebot?.theme?.chat}
              onChatThemeChange={handleChatThemeChange}
            />
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  )
}
