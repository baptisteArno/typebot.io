import { ConversationTagStep } from 'models'
import React from 'react'
import { HStack, Stack, Tag, Text } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'

type Props = {
  step: ConversationTagStep
}

const ConversationTagContent = ({ step }: Props) => {
  const selectedTags = step?.options?.tags?.length ? step.options.tags : [{ name: '...' }];

  return (
    <Stack>
      <Text>
        Tags selecionadas:
      </Text>
      <HStack spacing={4}>
        {
          selectedTags?.map((item: any) => (
            <Tag key={item._id} variant='solid'>
              {item.name}
            </Tag>
          ))
        }
      </HStack>
    </Stack>
  )
}

export default ConversationTagContent