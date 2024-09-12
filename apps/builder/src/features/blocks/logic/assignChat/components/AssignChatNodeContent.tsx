import React from 'react'
import { Tag, Text } from '@chakra-ui/react'
import { AssignChatBlock } from '@typebot.io/schemas'

type Props = {
  options: AssignChatBlock['options']
}

export const AssignChatNodeContent = ({ options }: Props) => {
  const assignType = options?.assignType || 'Agent'
  const email = options?.email || ''

  if (assignType === 'Handover')
    return (
      <Text color="currentcolor" noOfLines={2}>
        Handover Chat
      </Text>
    )

  return (
    <Text color="currentcolor" noOfLines={2}>
      Assign Chat to {assignType && <Tag>{assignType}</Tag>} {email && email}
    </Text>
  )
}
