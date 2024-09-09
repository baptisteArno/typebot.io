import React from 'react'
import { Text } from '@chakra-ui/react'
import { AssignChatBlock } from '@typebot.io/schemas'

type Props = { email: NonNullable<AssignChatBlock['options']>['email'] }

export const AssignChatNodeContent = ({ email }: Props) => (
  <Text color={email ? 'currentcolor' : 'gray.500'} noOfLines={2}>
    {email ? `Assign chat to ${email}` : 'Configure assignee email...'}
  </Text>
)
