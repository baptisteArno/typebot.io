import React from 'react'
import { Text } from '@chakra-ui/react'
import { RedirectBlock } from '@typebot.io/schemas'

type Props = { url: NonNullable<RedirectBlock['options']>['url'] }

export const RedirectNodeContent = ({ url }: Props) => (
  <Text color={url ? 'currentcolor' : 'gray.500'} noOfLines={2}>
    {url ? `Redirect to ${url}` : 'Configure...'}
  </Text>
)
