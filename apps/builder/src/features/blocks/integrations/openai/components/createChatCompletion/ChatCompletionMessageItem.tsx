import { DropdownList } from '@/components/DropdownList'
import { TextInput } from '@/components/inputs'
import { TableListItemProps } from '@/components/TableList'
import { Stack } from '@chakra-ui/react'
import {
  chatCompletionMessageRoles,
  ChatCompletionOpenAIOptions,
} from 'models/features/blocks/integrations/openai'

type Props = TableListItemProps<ChatCompletionOpenAIOptions['messages'][number]>

export const ChatCompletionMessageItem = ({ item, onItemChange }: Props) => {
  const changeRole = (role: (typeof chatCompletionMessageRoles)[number]) => {
    onItemChange({ ...item, role })
  }

  const changeContent = (content: string) => {
    onItemChange({ ...item, content })
  }

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <DropdownList
        currentItem={item.role}
        items={chatCompletionMessageRoles}
        onItemSelect={changeRole}
        placeholder="Select role"
      />
      <TextInput
        defaultValue={item.content}
        onChange={changeContent}
        placeholder="Content"
      />
    </Stack>
  )
}
