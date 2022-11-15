import React from 'react'
import { Text } from '@chakra-ui/react'
import { EmailInputBlock } from 'models'

type Props = {
  placeholder: EmailInputBlock['options']['labels']['placeholder']
}

export const EmailInputNodeContent = ({ placeholder }: Props) => (
  <Text color={'gray.500'}>{placeholder}</Text>
)
