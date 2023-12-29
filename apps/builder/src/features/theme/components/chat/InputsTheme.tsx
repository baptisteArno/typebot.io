import { Stack, Flex, Text } from '@chakra-ui/react'
import { InputColors, Theme } from '@typebot.io/schemas'
import React from 'react'
import { ColorPicker } from '../../../../components/ColorPicker'
import { useTranslate } from '@tolgee/react'

type Props = {
  inputs: NonNullable<Theme['chat']>['inputs']
  onInputsChange: (buttons: InputColors) => void
}

export const InputsTheme = ({ inputs, onInputsChange }: Props) => {
  const { t } = useTranslate()

  const handleBackgroundChange = (backgroundColor: string) =>
    onInputsChange({ ...inputs, backgroundColor })
  const handleTextChange = (color: string) =>
    onInputsChange({ ...inputs, color })
  const handlePlaceholderChange = (placeholderColor: string) =>
    onInputsChange({ ...inputs, placeholderColor })

  return (
    <Stack data-testid="inputs-theme">
      <Flex justify="space-between" align="center">
        <Text>{t('theme.sideMenu.chat.theme.background')}</Text>
        <ColorPicker
          value={inputs?.backgroundColor}
          onColorChange={handleBackgroundChange}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>{t('theme.sideMenu.chat.theme.text')}</Text>
        <ColorPicker value={inputs?.color} onColorChange={handleTextChange} />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>{t('theme.sideMenu.chat.theme.placeholder')}</Text>
        <ColorPicker
          value={inputs?.placeholderColor}
          onColorChange={handlePlaceholderChange}
        />
      </Flex>
    </Stack>
  )
}
