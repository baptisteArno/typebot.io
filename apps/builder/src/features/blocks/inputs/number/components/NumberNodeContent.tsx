import React from 'react'
import { Text } from '@chakra-ui/react'
import { NumberInputBlock } from 'models'

type Props = {
  placeholder: NumberInputBlock['options']['labels']['placeholder']
}

export const NumberNodeContent = ({ placeholder }: Props) => (
  <Text color={'gray.500'}>{placeholder}</Text>
)
