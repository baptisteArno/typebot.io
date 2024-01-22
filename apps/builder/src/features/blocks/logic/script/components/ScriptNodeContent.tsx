import React from 'react'
import { Text } from '@chakra-ui/react'
import { ScriptBlock } from '@typebot.io/schemas'
import { defaultScriptOptions } from '@typebot.io/schemas/features/blocks/logic/script/constants'

type Props = {
  options: ScriptBlock['options']
}

export const ScriptNodeContent = ({
  options: { name, content } = {},
}: Props) => (
  <Text color={content ? 'currentcolor' : 'gray.500'} noOfLines={1}>
    {content ? `Run ${name ?? defaultScriptOptions.name}` : 'Configure...'}
  </Text>
)
