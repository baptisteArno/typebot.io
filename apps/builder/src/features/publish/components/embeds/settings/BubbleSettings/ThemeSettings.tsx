import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react'
import { BubbleProps } from '@typebot.io/js'
import {
  ButtonTheme,
  PreviewMessageTheme,
} from '@typebot.io/js/dist/features/bubble/types'
import { ButtonThemeSettings } from './ButtonThemeSettings'
import { PreviewMessageThemeSettings } from './PreviewMessageThemeSettings'

type Props = {
  isPreviewMessageEnabled: boolean
  theme: BubbleProps['theme']
  onChange: (newBubbleTheme: BubbleProps['theme']) => void
}

export const ThemeSettings = ({
  isPreviewMessageEnabled,
  theme,
  onChange,
}: Props) => {
  const updateButtonTheme = (button?: ButtonTheme) => {
    onChange({
      ...theme,
      button,
    })
  }

  const updatePreviewMessageTheme = (previewMessage?: PreviewMessageTheme) => {
    onChange({
      ...theme,
      previewMessage,
    })
  }

  return (
    <Accordion allowMultiple>
      <AccordionItem>
        <AccordionButton px="0">
          <HStack flex="1">
            <Text>Theme</Text>
          </HStack>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel as={Stack} pb={4} spacing={4} px="0">
          <ButtonThemeSettings
            buttonTheme={theme?.button}
            onChange={updateButtonTheme}
          />
          {isPreviewMessageEnabled ? (
            <PreviewMessageThemeSettings
              previewMessageTheme={theme?.previewMessage}
              onChange={updatePreviewMessageTheme}
            />
          ) : null}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
