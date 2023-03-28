import { Stack, Flex, Text } from '@chakra-ui/react'
import { InputColors } from '@typebot.io/schemas'
import React from 'react'
import { ColorPicker } from '../../../../components/ColorPicker'

type Props = {
  inputs: InputColors
  onInputsChange: (buttons: InputColors) => void
}

export const InputsTheme = ({ inputs, onInputsChange }: Props) => {
  const handleBackgroundChange = (backgroundColor: string) =>
    onInputsChange({ ...inputs, backgroundColor })
  const handleTextChange = (color: string) =>
    onInputsChange({ ...inputs, color })
  const handlePlaceholderChange = (placeholderColor: string) =>
    onInputsChange({ ...inputs, placeholderColor })

  return (
    <Stack data-testid="inputs-theme">
      <Flex justify="space-between" align="center">
        <Text>Background:</Text>
        <ColorPicker
          value={inputs.backgroundColor}
          onColorChange={handleBackgroundChange}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>Text:</Text>
        <ColorPicker value={inputs.color} onColorChange={handleTextChange} />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>Placeholder text:</Text>
        <ColorPicker
          value={inputs.placeholderColor}
          onColorChange={handlePlaceholderChange}
        />
      </Flex>
    </Stack>
  )
}
