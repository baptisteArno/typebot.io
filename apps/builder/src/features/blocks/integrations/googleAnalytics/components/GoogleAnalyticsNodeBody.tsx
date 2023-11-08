import React from 'react'
import { Text } from '@chakra-ui/react'
import { GoogleAnalyticsBlock } from '@typebot.io/schemas'

type Props = {
  action: NonNullable<GoogleAnalyticsBlock['options']>['action']
}

export const GoogleAnalyticsNodeBody = ({ action }: Props) => (
  <Text color={action ? 'currentcolor' : 'gray.500'} noOfLines={1}>
    {action ? `Track "${action}"` : 'Configure...'}
  </Text>
)
