import React from 'react'
import { Text } from '@chakra-ui/react'
import { PhoneNumberInputOptions } from 'models'

type Props = {
  placeholder: PhoneNumberInputOptions['labels']['placeholder']
}

export const PhoneNodeContent = ({ placeholder }: Props) => (
  <Text color={'gray.500'}>{placeholder}</Text>
)
