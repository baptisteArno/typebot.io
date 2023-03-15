import React from 'react'
import { Text } from '@chakra-ui/react'
import { GoogleSheetsAction } from '@typebot.io/schemas'

type Props = {
  action?: GoogleSheetsAction
}

export const GoogleSheetsNodeContent = ({ action }: Props) => (
  <Text color={action ? 'currentcolor' : 'gray.500'} noOfLines={1}>
    {action ?? 'Configure...'}
  </Text>
)
