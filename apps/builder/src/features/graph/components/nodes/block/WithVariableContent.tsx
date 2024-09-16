import { Text, TextProps } from '@chakra-ui/react'
import React from 'react'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { byId } from '@typebot.io/lib'
import { VariableTag } from './VariableTag'

type Props = {
  variableId: string
} & TextProps

export const WithVariableContent = ({ variableId, ...props }: Props) => {
  const { typebot } = useTypebot()
  const variableName = typebot?.variables.find(byId(variableId))?.name

  return (
    <Text w="calc(100% - 25px)" {...props}>
      Collect <VariableTag variableName={variableName ?? ''} />
    </Text>
  )
}
