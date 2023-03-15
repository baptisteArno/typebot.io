import React from 'react'
import { Text } from '@chakra-ui/react'
import { GoogleAnalyticsOptions } from '@typebot.io/schemas'

type Props = {
  action: GoogleAnalyticsOptions['action']
}

export const GoogleAnalyticsNodeContent = ({ action }: Props) => (
  <Text color={action ? 'currentcolor' : 'gray.500'} noOfLines={1}>
    {action ? `Track "${action}"` : 'Configure...'}
  </Text>
)
