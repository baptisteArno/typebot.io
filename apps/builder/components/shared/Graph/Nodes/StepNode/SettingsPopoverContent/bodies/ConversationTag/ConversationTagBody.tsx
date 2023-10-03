import { FormLabel, Stack } from '@chakra-ui/react'
import { ConversationTagOptions } from 'models'
import React from 'react'
import { ConversationTagSelect } from './ConversationTagSelect'

type ConversationTagBodyProps = {
  options: ConversationTagOptions
  onOptionsChange: (options: ConversationTagOptions) => void
}

export const ConversationTagBody = ({
  options,
  onOptionsChange,
}: ConversationTagBodyProps) => {

  const handleTagChange = (e: any) => {
    onOptionsChange({
      ...options,
      tagId: e.tag
    })
  }

  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="button">
          Tagear conversa:
        </FormLabel>
        <ConversationTagSelect selectedTag={options.tagId} onSelect={handleTagChange} />
      </Stack>
    </Stack>
  )
}
