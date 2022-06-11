import React from 'react'
import { Text } from '@chakra-ui/react'

type Props = { label?: string }

export const ConfigureContent = ({ label }: Props) => (
  <Text color={label ? 'currentcolor' : 'gray.500'} noOfLines={0}>
    {label ?? 'Configure...'}
  </Text>
)
