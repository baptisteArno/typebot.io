import React from 'react'
import { Text } from '@chakra-ui/react'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { useTranslate } from '@tolgee/react'

type Props = {
  variableId?: string
}
export const DateNodeContent = ({ variableId }: Props) => {
  const { t } = useTranslate()

  return variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={'gray.500'}>{t('blocks.inputs.date.placeholder.label')}</Text>
  )
}
