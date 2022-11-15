import React from 'react'
import { Text } from '@chakra-ui/react'
import { CodeOptions } from 'models'

type Props = CodeOptions

export const CodeNodeContent = ({ name, content }: Props) => (
  <Text color={content ? 'currentcolor' : 'gray.500'} noOfLines={1}>
    {content ? `Run ${name}` : 'Configure...'}
  </Text>
)
