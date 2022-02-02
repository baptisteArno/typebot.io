import React from 'react'
import { Text } from '@chakra-ui/react'

type Props = { placeholder: string }

export const PlaceholderContent = ({ placeholder }: Props) => (
  <Text color={'gray.500'}>{placeholder}</Text>
)
