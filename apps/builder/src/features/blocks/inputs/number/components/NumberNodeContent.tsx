import React from 'react'
import { Text } from '@chakra-ui/react'
import { NumberInputBlock } from '@typebot.io/schemas'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: NumberInputBlock['options']
}

export const NumberNodeContent = ({
  options: { variableId, labels } = {},
}: Props) => {
	const { t } = useTranslate()
	
  return variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={'gray.500'}>
      {labels?.placeholder ?? t("editor.blocks.inputs.number.placeholder.label")}
    </Text>
  )
}