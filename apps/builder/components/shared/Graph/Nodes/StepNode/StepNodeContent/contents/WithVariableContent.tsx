import { chakra, Stack, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useTypebot } from 'contexts/TypebotContext'
import { OctaProperty, Variable } from 'models'
import { useWorkspace } from 'contexts/WorkspaceContext'

type Props = {
  variableId?: string
  property?: OctaProperty
}

export const WithVariableContent = ({ variableId, property }: Props) => {
  const { typebot } = useTypebot()
  const { createChatField } = useWorkspace()

  const [variableName, setVariableName] = useState<string>()

  useEffect(() => {
    if (typebot?.variables) {
      const variable = typebot.variables.find(
        (variable) => variable.variableId === variableId
      )

      if (!variable && property?.token) createChatField(property, variableId)

      const variableName = variable?.token || property?.token || 'não salvar'
      setVariableName(variableName)
    }
    return () => {
      setVariableName('')
    }
  }, [typebot?.variables, variableId])

  return (
    <Stack>
      <Text>Salvar resposta em:</Text>
      <chakra.span
        w={'100%'}
        gap={'8px'}
        bgColor="orange.400"
        color="white"
        rounded="md"
        py="0.5"
        px="1"
      >
        {variableName}
      </chakra.span>
    </Stack>
  )
}
