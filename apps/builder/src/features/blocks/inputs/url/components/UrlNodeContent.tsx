import React from 'react'
import { Text } from '@chakra-ui/react'
import { WithVariableContent } from '@/features/graph/components/nodes/block/WithVariableContent'
import { UrlInputBlock } from '@typebot.io/schemas'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: UrlInputBlock['options']
}

export const UrlNodeContent = ({ options }: Props) => {
	const { t } = useTranslate()

  return options?.variableId ? (
    <WithVariableContent variableId={options.variableId} />
  ) : (
    <Text color={'gray.500'} w="90%">
      {options?.labels?.placeholder ??
        t("editor.blocks.inputs.url.placeholder.label")}
    </Text>
  )
}
