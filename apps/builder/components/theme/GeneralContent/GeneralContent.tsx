import {
  AccordionItem,
  AccordionButton,
  HStack,
  Heading,
  AccordionIcon,
  AccordionPanel,
  Stack,
} from '@chakra-ui/react'
import { PencilIcon } from 'assets/icons'
import { Background } from 'models'
import { useTypebot } from 'contexts/TypebotContext/TypebotContext'
import React from 'react'
import { BackgroundSelector } from './BackgroundSelector'
import { FontSelector } from './FontSelector'

export const GeneralContent = () => {
  const { typebot, updateTypebot } = useTypebot()

  const handleSelectFont = (font: string) => {
    if (!typebot) return
    updateTypebot({
      theme: {
        ...typebot.theme,
        general: { ...typebot.theme.general, font },
      },
    })
  }

  const handleBackgroundChange = (background: Background) => {
    if (!typebot) return
    updateTypebot({
      theme: {
        ...typebot.theme,
        general: { ...typebot.theme.general, background },
      },
    })
  }
  return (
    <AccordionItem>
      <AccordionButton py={6}>
        <HStack flex="1" pl={2}>
          <PencilIcon />
          <Heading fontSize="lg" color="gray.700">
            General
          </Heading>
        </HStack>
        <AccordionIcon />
      </AccordionButton>
      {typebot && (
        <AccordionPanel as={Stack} pb={4} spacing={6}>
          <FontSelector
            activeFont={typebot.theme.general.font}
            onSelectFont={handleSelectFont}
          />
          <BackgroundSelector
            initialBackground={typebot.theme.general.background}
            onBackgroundChange={handleBackgroundChange}
          />
        </AccordionPanel>
      )}
    </AccordionItem>
  )
}
