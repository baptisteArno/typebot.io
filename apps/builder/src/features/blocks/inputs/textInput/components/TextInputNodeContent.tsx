import React from 'react'
import { Text } from '@chakra-ui/react'
import { TextInputOptions } from 'models'

type Props = {
  placeholder: TextInputOptions['labels']['placeholder']
  isLong: TextInputOptions['isLong']
}

export const TextInputNodeContent = ({ placeholder, isLong }: Props) => (
  <Text color={'gray.500'} h={isLong ? '100px' : 'auto'}>
    {placeholder}
  </Text>
)
