import React from 'react'
import { Text } from '@chakra-ui/react'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { PhoneNumberInputBlock } from '@typebot.io/schemas'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: PhoneNumberInputBlock['options']
}

export const PhoneNodeContent = ({
  options: { variableId, labels } = {},
}: Props) => {
	const { t } = useTranslate()

  return variableId ? (
    <WithVariableContent variableId={variableId} />
  ) : (
    <Text color={'gray.500'}>
      {labels?.placeholder ?? t("editor.blocks.inputs.phone.placeholder.label")}
    </Text>
  )
}
