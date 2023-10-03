import { useTypebot } from 'contexts/TypebotContext'
import { ConversationTagStep } from 'models'
import React, { useEffect, useState } from 'react'
import { chakra, Stack, Text } from '@chakra-ui/react'

type Props = {
  step: ConversationTagStep
}

const ConversationTagContent = ({ step }: Props) => {
  const { tagsList } = useTypebot();

  const [selectedTag, setSelectedTag] = useState<any>();

  useEffect(() => {
    if (tagsList) {
      const item = tagsList.find(g => g.id === step?.options?.tagId)
      setSelectedTag(item);
    }
    return () => {
      setSelectedTag(undefined)
    };
  }, [tagsList, step]);

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
        {selectedTag?.name || '...'}
      </chakra.span>
    </Stack>
  )
}

export default ConversationTagContent