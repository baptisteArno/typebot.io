import { Text } from '@chakra-ui/react'
import { WaitOptions } from '@typebot.io/schemas'
import React from 'react'

type Props = {
  options: WaitOptions
}

export const WaitNodeContent = ({ options: { secondsToWaitFor } }: Props) => (
  <Text color={secondsToWaitFor ? 'currentcolor' : 'gray.500'} noOfLines={1}>
    {secondsToWaitFor ? `Wait for ${secondsToWaitFor}s` : 'Configure...'}
  </Text>
)
