import { ColorPicker } from '@/components/ColorPicker'
import { Heading, HStack, Input, Stack, Text } from '@chakra-ui/react'
import { ButtonTheme } from '@typebot.io/js/dist/features/bubble/types'
import React from 'react'

type Props = {
  buttonTheme: ButtonTheme | undefined
  onChange: (newButtonTheme?: ButtonTheme) => void
}

export const ButtonThemeSettings = ({ buttonTheme, onChange }: Props) => {
  const updateBackgroundColor = (backgroundColor: string) => {
    onChange({
      ...buttonTheme,
      backgroundColor,
    })
  }

  const updateIconColor = (iconColor: string) => {
    onChange({
      ...buttonTheme,
      iconColor,
    })
  }

  const updateCustomIconSrc = (customIconSrc: string) => {
    onChange({
      ...buttonTheme,
      customIconSrc,
    })
  }

  return (
    <Stack spacing={4} borderWidth="1px" rounded="md" p="4">
      <Heading size="sm">Button</Heading>
      <Stack spacing={4}>
        <HStack justify="space-between">
          <Text>Background color</Text>
          <ColorPicker
            defaultValue={buttonTheme?.backgroundColor}
            onColorChange={updateBackgroundColor}
          />
        </HStack>
        <HStack justify="space-between">
          <Text>Icon color</Text>
          <ColorPicker
            defaultValue={buttonTheme?.iconColor}
            onColorChange={updateIconColor}
          />
        </HStack>
        <HStack justify="space-between">
          <Text>Custom icon</Text>
          <Input
            placeholder={'Paste image link (.png, .svg)'}
            value={buttonTheme?.customIconSrc}
            onChange={(e) => updateCustomIconSrc(e.target.value)}
            minW="0"
            w="300px"
            size="sm"
          />
        </HStack>
      </Stack>
    </Stack>
  )
}
