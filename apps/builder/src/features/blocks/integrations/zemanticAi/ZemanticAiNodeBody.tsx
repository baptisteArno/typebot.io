import React from 'react'
import { Text } from '@chakra-ui/react'
import { ZemanticAiOptions } from '@typebot.io/schemas'

type Props = {
  projectId: ZemanticAiOptions['projectId']
}

export const ZemanticAiNodeBody = ({ projectId }: Props) => (
  <>
    <Text color={projectId ? 'currentcolor' : 'gray.500'} noOfLines={1}>
      {projectId ? `Search: ${projectId}` : 'Configure...'}
    </Text>
  </>
)
