import { Stack, Flex, Text } from '@chakra-ui/react'
import { ContainerColors } from 'models'
import React from 'react'
import { ColorPicker } from '../GeneralSettings/ColorPicker'

type Props = {
  guestBubbles?: ContainerColors
  onGuestBubblesChange: (hostBubbles: ContainerColors) => void
}

const defaultBackgroundColor = '#ff8e21'
const defaultTextColor = '#ffffff'
export const GuestBubbles = ({ guestBubbles, onGuestBubblesChange }: Props) => {
  const handleBackgroundChange = (backgroundColor: string) =>
    onGuestBubblesChange({ ...guestBubbles, backgroundColor })
  const handleTextChange = (color: string) =>
    onGuestBubblesChange({ ...guestBubbles, color })

  return (
    <Stack>
      <Flex justify="space-between" align="center">
        <Text>Background:</Text>
        <ColorPicker
          initialColor={guestBubbles?.backgroundColor ?? defaultBackgroundColor}
          onColorChange={handleBackgroundChange}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>Text:</Text>
        <ColorPicker
          initialColor={guestBubbles?.color ?? defaultTextColor}
          onColorChange={handleTextChange}
        />
      </Flex>
    </Stack>
  )
}
