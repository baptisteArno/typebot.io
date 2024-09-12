import { DropdownList } from '@/components/DropdownList'
import { TextInput } from '@/components/inputs'
import { Stack } from '@chakra-ui/react'
import { AssignChatBlock } from '@typebot.io/schemas'
import { defaultAssignChatOptions } from '@typebot.io/schemas/features/blocks/logic/assignChat/constants'

import { assignChatTypeOptions } from '@typebot.io/schemas/features/blocks/logic/constants'

type Props = {
  options: AssignChatBlock['options']
  onOptionsChange: (options: AssignChatBlock['options']) => void
}

export const AssignChatSettings = ({ options, onOptionsChange }: Props) => {
  const handleEmailChange = (email?: string) =>
    onOptionsChange({ assignType: options?.assignType || 'Agent', email })

  const updateAssignChatType = (type: (typeof assignChatTypeOptions)[number]) =>
    onOptionsChange({
      assignType: type,
      email: type === 'Handover' ? '' : options?.email,
    })

  return (
    <Stack spacing={4}>
      <DropdownList
        label="Visibility:"
        moreInfoTooltip='This setting determines who can see the uploaded files. "Public" means that anyone who has the link can see the files. "Private" means that only a members of this workspace can see the files.'
        currentItem={options?.assignType || defaultAssignChatOptions.assignType}
        onItemSelect={updateAssignChatType}
        items={assignChatTypeOptions}
      />
      {options?.assignType !== 'Handover' && (
        <TextInput
          label="Assignee Email:"
          defaultValue={options?.email}
          placeholder="Type an Assignee Email"
          onChange={handleEmailChange}
        />
      )}
    </Stack>
  )
}
