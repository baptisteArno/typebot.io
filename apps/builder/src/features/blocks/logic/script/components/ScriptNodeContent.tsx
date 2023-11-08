import React from 'react'
import { Text } from '@chakra-ui/react'
import { ScriptBlock } from '@typebot.io/schemas'

type Props = {
  options: ScriptBlock['options']
}

export const ScriptNodeContent = ({
  options: { name, content } = {},
}: Props) => (
  <Text color={content ? 'currentcolor' : 'gray.500'} noOfLines={1}>
    {content ? `Run ${name}` : 'Configure...'}
  </Text>
)
