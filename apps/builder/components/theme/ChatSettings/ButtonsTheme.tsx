import { Stack, Flex, Text } from '@chakra-ui/react'
import { ContainerColors } from 'models'
import React from 'react'
import { ColorPicker } from '../GeneralSettings/ColorPicker'

type Props = {
  buttons?: ContainerColors
  onButtonsChange: (buttons: ContainerColors) => void
}

const defaultBackgroundColor = '#0042da'
const defaultTextColor = '#ffffff'

export const ButtonsTheme = ({ buttons, onButtonsChange }: Props) => {
  const handleBackgroundChange = (backgroundColor: string) =>
    onButtonsChange({ ...buttons, backgroundColor })
  const handleTextChange = (color: string) =>
    onButtonsChange({ ...buttons, color })

  return (
    <Stack>
      <Flex justify="space-between" align="center">
        <Text>Background:</Text>
        <ColorPicker
          initialColor={buttons?.backgroundColor ?? defaultBackgroundColor}
          onColorChange={handleBackgroundChange}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>Text:</Text>
        <ColorPicker
          initialColor={buttons?.color ?? defaultTextColor}
          onColorChange={handleTextChange}
        />
      </Flex>
    </Stack>
  )
}
