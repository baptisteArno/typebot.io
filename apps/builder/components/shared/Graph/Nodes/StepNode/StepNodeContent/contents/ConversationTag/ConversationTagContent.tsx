import { ConversationTagStep } from 'models'
import React, { useEffect, useState } from 'react'
import { HStack, Stack, Tag, Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'

type Props = {
  step: ConversationTagStep
}

const ConversationTagContent = ({ step }: Props) => {
  const { tagsList } = useTypebot();
  const [selectedTags, setSelectedTags] = useState<any>();

  useEffect(() => {
    if (step?.options?.tags) {
      const selectedTags = step.options.tags.map(tag => tagsList.find(t => t._id === tag._id));
      setSelectedTags(selectedTags);
    }
  }, [step]);

  return (
    <Stack>
      <Text>
        Tags selecionadas:
      </Text>
      <HStack spacing={4}>
        {
          selectedTags?.map((item: any) => (
            <Tag key={item._id} variant='solid'>
              {item.name || '...'}
            </Tag>
          ))
        }
      </HStack>
    </Stack>
  )
}

export default ConversationTagContent