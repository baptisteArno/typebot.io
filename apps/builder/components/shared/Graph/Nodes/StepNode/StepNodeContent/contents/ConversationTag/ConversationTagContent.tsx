import { useTypebot } from 'contexts/TypebotContext'
import { Options } from 'got'
import { ConversationTagStep } from 'models'
import React, { useEffect, useState } from 'react'
import { Container, Space } from './ConversationTagContent.style'
import { chakra, Stack, Text } from '@chakra-ui/react'
import { OctaDivider } from 'components/octaComponents/OctaDivider/OctaDivider'

type Props = {
  step: ConversationTagStep
}

const ConversationTagContent = ({ step }: Props) => {
  //const { octaGroups } = useTypebot();

  //const [selectedGroup, setSelectedGroup] = useState<any>();

  /*useEffect(() => {
    if (octaGroups) {
      const item = octaGroups.find(g => g.id === step?.options?.assignTo)
      setSelectedGroup(item);
    }
    return () => {
      setSelectedGroup(undefined)
    };
  }, [octaGroups, step]);*/

  return (
    <Stack>
      <Text>
        Tags selecionadas:
      </Text>
      <chakra.span
        bgColor="gray.400"
        color="white"
        rounded="md"
        py="0.5"
        px="1"
      >
        {/*selectedGroup?.name || '...'*/}
      </chakra.span>
    </Stack>
  )
}

export default ConversationTagContent