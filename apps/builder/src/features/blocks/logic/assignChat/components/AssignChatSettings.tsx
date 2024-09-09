import { TextInput } from '@/components/inputs'
import { Stack } from '@chakra-ui/react'
import { AssignChatBlock } from '@typebot.io/schemas'

type Props = {
  options: AssignChatBlock['options']
  onOptionsChange: (options: AssignChatBlock['options']) => void
}

export const AssignChatSettings = ({ options, onOptionsChange }: Props) => {
  const handleEmailChange = (email?: string) =>
    onOptionsChange({ ...options, email })

  return (
    <Stack spacing={4}>
      <TextInput
        label="Assignee Email:"
        defaultValue={options?.email}
        placeholder="Type an Assignee Email"
        onChange={handleEmailChange}
      />
    </Stack>
  )
}
