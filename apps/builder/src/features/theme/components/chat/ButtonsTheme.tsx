import { Stack, Flex, Text } from '@chakra-ui/react'
import { ContainerColors } from '@typebot.io/schemas'
import React from 'react'
import { ColorPicker } from '../../../../components/ColorPicker'

type Props = {
  buttons: ContainerColors
  onButtonsChange: (buttons: ContainerColors) => void
}

export const ButtonsTheme = ({ buttons, onButtonsChange }: Props) => {
  const handleBackgroundChange = (backgroundColor: string) =>
    onButtonsChange({ ...buttons, backgroundColor })
  const handleTextChange = (color: string) =>
    onButtonsChange({ ...buttons, color })

  return (
    <Stack data-testid="buttons-theme">
      <Flex justify="space-between" align="center">
        <Text>Background:</Text>
        <ColorPicker
          value={buttons.backgroundColor}
          onColorChange={handleBackgroundChange}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>Text:</Text>
        <ColorPicker value={buttons.color} onColorChange={handleTextChange} />
      </Flex>
    </Stack>
  )
}
