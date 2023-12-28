import React from 'react'
import { Text } from '@chakra-ui/react'
import { EmailInputBlock } from '@typebot.io/schemas'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: EmailInputBlock['options']
}

export const EmailInputNodeContent = ({
  options: { variableId, labels } = {},
}: Props) => {
  const { t } = useTranslate()

  return variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={'gray.500'}>
      {labels?.placeholder ?? t('editor.blocks.inputs.email.placeholder.label')}
    </Text>
  )
}
