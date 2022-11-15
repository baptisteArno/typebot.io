import { InputBlock } from 'models'
import { chakra, Text } from '@chakra-ui/react'
import React from 'react'
import { useTypebot } from '@/features/editor'
import { byId } from 'utils'

type Props = {
  block: InputBlock
}

export const WithVariableContent = ({ block }: Props) => {
  const { typebot } = useTypebot()
  const variableName = typebot?.variables.find(
    byId(block.options.variableId)
  )?.name

  return (
    <Text>
      Collect{' '}
      <chakra.span
        bgColor="orange.400"
        color="white"
        rounded="md"
        py="0.5"
        px="1"
      >
        {variableName}
      </chakra.span>
    </Text>
  )
}
