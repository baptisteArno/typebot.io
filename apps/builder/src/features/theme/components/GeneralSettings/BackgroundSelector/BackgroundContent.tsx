import { Flex, Text } from '@chakra-ui/react'
import { Background, BackgroundType } from '@typebot.io/schemas'
import React from 'react'
import { ColorPicker } from '../../../../../components/ColorPicker'

type BackgroundContentProps = {
  background?: Background
  onBackgroundContentChange: (content: string) => void
}

const defaultBackgroundColor = '#ffffff'

export const BackgroundContent = ({
  background,
  onBackgroundContentChange,
}: BackgroundContentProps) => {
  const handleContentChange = (content: string) =>
    onBackgroundContentChange(content)

  switch (background?.type) {
    case BackgroundType.COLOR:
      return (
        <Flex justify="space-between" align="center">
          <Text>Background color:</Text>
          <ColorPicker
            initialColor={background.content ?? defaultBackgroundColor}
            onColorChange={handleContentChange}
          />
        </Flex>
      )
    case BackgroundType.IMAGE:
      return (
        <Flex>
          <Text>Image</Text>
        </Flex>
      )
    default:
      return <></>
  }
}
