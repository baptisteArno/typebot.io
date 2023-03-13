import { DropdownList } from '@/components/DropdownList'
import { TextInput } from '@/components/inputs'
import { VariableSearchInput } from '@/components/inputs/VariableSearchInput'
import { TableListItemProps } from '@/components/TableList'
import { Stack } from '@chakra-ui/react'
import { Variable } from 'models'
import {
  chatCompletionMessageCustomRoles,
  chatCompletionMessageRoles,
  ChatCompletionOpenAIOptions,
} from 'models/features/blocks/integrations/openai'

type Props = TableListItemProps<ChatCompletionOpenAIOptions['messages'][number]>

const roles = [
  ...chatCompletionMessageCustomRoles,
  ...chatCompletionMessageRoles,
]

export const ChatCompletionMessageItem = ({ item, onItemChange }: Props) => {
  const changeRole = (role: (typeof roles)[number]) => {
    onItemChange({
      ...item,
      role,
      content: undefined,
    })
  }

  const changeSingleMessageContent = (content: string) => {
    if (item.role === 'Messages sequence ✨') return
    onItemChange({ ...item, content })
  }

  const changeAssistantVariableId = (
    variable: Pick<Variable, 'id'> | undefined
  ) => {
    if (item.role !== 'Messages sequence ✨') return
    onItemChange({
      ...item,
      content: {
        ...item.content,
        assistantMessagesVariableId: variable?.id,
      },
    })
  }

  const changeUserVariableId = (variable: Pick<Variable, 'id'> | undefined) => {
    if (item.role !== 'Messages sequence ✨') return
    onItemChange({
      ...item,
      content: {
        ...item.content,
        userMessagesVariableId: variable?.id,
      },
    })
  }

  return (
    <Stack p="4" rounded="md" flex="1" borderWidth="1px">
      <DropdownList
        currentItem={item.role}
        items={roles}
        onItemSelect={changeRole}
        placeholder="Select type"
      />
      {item.role === 'Messages sequence ✨' ? (
        <>
          <VariableSearchInput
            initialVariableId={item.content?.assistantMessagesVariableId}
            onSelectVariable={changeAssistantVariableId}
            placeholder="Assistant messages variable"
          />
          <VariableSearchInput
            initialVariableId={item.content?.userMessagesVariableId}
            onSelectVariable={changeUserVariableId}
            placeholder="User messages variable"
          />
        </>
      ) : (
        <TextInput
          defaultValue={item.content}
          onChange={changeSingleMessageContent}
          placeholder="Content"
        />
      )}
    </Stack>
  )
}
