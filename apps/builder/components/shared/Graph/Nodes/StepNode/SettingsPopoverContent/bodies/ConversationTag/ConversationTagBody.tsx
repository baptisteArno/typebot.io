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
  const handleDefaultConversationTagChange = (e: any) => {
    const option = e

    onOptionsChange({
      ...options,
      ...option,
    })
  }
  
  return (
    <Stack spacing={4}>
      <Stack>
        <FormLabel mb="0" htmlFor="placeholder">
          Tagear conversa:
        </FormLabel>
        <ConversationTagSelect
          //selectedUserGroup={options.tags}
          onSelect={handleDefaultConversationTagChange}
        />
      </Stack>
    </Stack>
  )
}
