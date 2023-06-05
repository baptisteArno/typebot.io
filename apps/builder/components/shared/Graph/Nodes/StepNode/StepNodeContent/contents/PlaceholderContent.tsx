import React from 'react'
import { Text } from '@chakra-ui/react'

type Props = { placeholder: string; isLong?: boolean }

export const PlaceholderContent = ({ placeholder, isLong }: Props) => (
  <Text color={'gray.500'} h={isLong ? '100px' : 'auto'} ml={'8px'}>
    {placeholder}
  </Text>
)
