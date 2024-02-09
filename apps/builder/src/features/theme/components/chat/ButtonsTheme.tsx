import { Stack, Flex, Text } from '@chakra-ui/react'
import { Theme } from '@typebot.io/schemas'
import React from 'react'
import { ColorPicker } from '../../../../components/ColorPicker'
import { useTranslate } from '@tolgee/react'

type Props = {
  buttons: NonNullable<Theme['chat']>['buttons']
  onButtonsChange: (buttons: NonNullable<Theme['chat']>['buttons']) => void
}

export const ButtonsTheme = ({ buttons, onButtonsChange }: Props) => {
  const { t } = useTranslate()

  const handleBackgroundChange = (backgroundColor: string) =>
    onButtonsChange({ ...buttons, backgroundColor })
  const handleBorderChange = (borderColor: string) =>
    onButtonsChange({ ...buttons, borderColor })
  const handleTextChange = (color: string) =>
    onButtonsChange({ ...buttons, color })

  return (
    <Stack data-testid="buttons-theme">
      <Flex justify="space-between" align="center">
        <Text>{t('theme.sideMenu.chat.theme.background')}</Text>
        <ColorPicker
          value={buttons?.backgroundColor}
          onColorChange={handleBackgroundChange}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>{t('theme.sideMenu.chat.theme.border')}</Text>
        <ColorPicker
          value={buttons?.borderColor}
          onColorChange={handleBorderChange}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>{t('theme.sideMenu.chat.theme.text')}</Text>
        <ColorPicker value={buttons?.color} onColorChange={handleTextChange} />
      </Flex>
    </Stack>
  )
}
