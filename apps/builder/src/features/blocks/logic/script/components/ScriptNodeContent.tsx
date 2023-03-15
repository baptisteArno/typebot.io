import React from 'react'
import { Text } from '@chakra-ui/react'
import { ScriptOptions } from '@typebot.io/schemas'

type Props = ScriptOptions

export const ScriptNodeContent = ({ name, content }: Props) => (
  <Text color={content ? 'currentcolor' : 'gray.500'} noOfLines={1}>
    {content ? `Run ${name}` : 'Configure...'}
  </Text>
)
