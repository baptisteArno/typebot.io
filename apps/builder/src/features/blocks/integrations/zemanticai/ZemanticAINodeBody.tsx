import React from 'react'
import { Text } from '@chakra-ui/react'
import { ZemanticAIOptions } from '@typebot.io/schemas'

type Props = {
  projectId: ZemanticAIOptions['projectId']
}

export const ZemanticAINodeBody = ({ projectId }: Props) => (
  <>
    <Text color={projectId ? 'currentcolor' : 'gray.500'} noOfLines={1}>
      {projectId ? `Query Project: ${projectId}` : 'Configure...'}
    </Text>
  </>
)
