import { InputStep } from 'models'
import { chakra, Text } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useTypebot } from 'contexts/TypebotContext'
import { byId } from 'utils'

type Props = {
  variableId?: string
}

export const WithVariableContent = ({ variableId }: Props) => {
  const { typebot } = useTypebot()
  
  const [variableName, setVariableName] = useState<string>();

  useEffect(() => {
    if (typebot?.variables) {
      const variableName = typebot?.variables.find(
        (variable) => variable.variableId === variableId
      )?.token || '...'
      setVariableName(variableName);
    }
    return () => {
      setVariableName("")
    };
  }, [typebot?.variables, variableId]);

  return (
    <Text>
      Salvar resposta em {' '}
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
