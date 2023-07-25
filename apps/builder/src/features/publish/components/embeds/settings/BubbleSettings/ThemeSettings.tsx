import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react'
import { BubbleProps } from '@typebot.io/nextjs'
import {
  BubbleTheme,
  ButtonTheme,
  PreviewMessageTheme,
} from '@typebot.io/nextjs'
import { ButtonThemeSettings } from './ButtonThemeSettings'
import { PreviewMessageThemeSettings } from './PreviewMessageThemeSettings'
import { ChevronDownIcon } from '@/components/icons'

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

  const updatePlacement = (placement: BubbleTheme['placement']) => {
    onChange({
      ...theme,
      placement,
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
          <HStack justify="space-between">
            <Text>Placement</Text>
            <Menu>
              <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />}>
                {theme?.placement ?? 'right'}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => updatePlacement('right')}>
                  right
                </MenuItem>
                <MenuItem onClick={() => updatePlacement('left')}>
                  left
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
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
