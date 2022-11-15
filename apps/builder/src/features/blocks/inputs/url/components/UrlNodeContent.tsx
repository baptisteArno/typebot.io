import React from 'react'
import { Text } from '@chakra-ui/react'
import { UrlInputOptions } from 'models'

type Props = {
  placeholder: UrlInputOptions['labels']['placeholder']
}

export const UrlNodeContent = ({ placeholder }: Props) => (
  <Text color={'gray.500'}>{placeholder}</Text>
)
