import React from 'react'
import { Text } from '@chakra-ui/react'
import { PixelBlock } from '@typebot.io/schemas'

type Props = {
  options: PixelBlock['options']
}

export const PixelNodeBody = ({ options }: Props) => (
  <Text
    color={options?.eventType || options?.pixelId ? 'currentcolor' : 'gray.500'}
    noOfLines={1}
  >
    {options?.eventType
      ? `Track "${options.eventType}"`
      : options?.pixelId
      ? 'Init Pixel'
      : 'Configure...'}
  </Text>
)
