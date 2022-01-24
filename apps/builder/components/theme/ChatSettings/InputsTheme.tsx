import { Stack, Flex, Text } from '@chakra-ui/react'
import { InputColors } from 'models'
import React from 'react'
import { ColorPicker } from '../GeneralSettings/ColorPicker'

type Props = {
  inputs?: InputColors
  onInputsChange: (buttons: InputColors) => void
}

const defaultBackgroundColor = '#ffffff'
const defaultTextColor = '#303235'
const defaultPlaceholderColor = '#9095A0'

export const InputsTheme = ({ inputs, onInputsChange }: Props) => {
  const handleBackgroundChange = (backgroundColor: string) =>
    onInputsChange({ ...inputs, backgroundColor })
  const handleTextChange = (color: string) =>
    onInputsChange({ ...inputs, color })
  const handlePlaceholderChange = (placeholderColor: string) =>
    onInputsChange({ ...inputs, placeholderColor })

  return (
    <Stack>
      <Flex justify="space-between" align="center">
        <Text>Background:</Text>
        <ColorPicker
          initialColor={inputs?.backgroundColor ?? defaultBackgroundColor}
          onColorChange={handleBackgroundChange}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>Text:</Text>
        <ColorPicker
          initialColor={inputs?.color ?? defaultTextColor}
          onColorChange={handleTextChange}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>Placeholder text:</Text>
        <ColorPicker
          initialColor={inputs?.placeholderColor ?? defaultPlaceholderColor}
          onColorChange={handlePlaceholderChange}
        />
      </Flex>
    </Stack>
  )
}
