import { DropdownList } from '@/components/DropdownList'
import { TextInput } from '@/components/inputs'
import { Stack } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'
import { AssignChatBlock } from '@typebot.io/schemas'
import {
  assignChatType,
  assignChatTypeOptions,
} from '@typebot.io/schemas/features/blocks/logic/assignChat/constants'

type Props = {
  options: AssignChatBlock['options']
  onOptionsChange: (options: AssignChatBlock['options']) => void
}

export const AssignChatSettings = ({ options, onOptionsChange }: Props) => {
  const { t } = useTranslate()
  const handleEmailChange = (email: string) =>
    onOptionsChange({
      assignType: options?.assignType,
      email,
    })

  const updateAssignChatType = (type: assignChatType) =>
    onOptionsChange({
      assignType: type,
    })

  return (
    <Stack spacing={4}>
      <DropdownList
        label={t('blocks.logic.assignChat.assignType')}
        moreInfoTooltip={t('blocks.logic.assignChat.assignType.tooltip')}
        currentItem={options?.assignType}
        onItemSelect={(_, item) => item && updateAssignChatType(item.value)}
        items={assignChatTypeOptions.map((option: assignChatType) => ({
          value: option,
          label: t('blocks.logic.assignChat.' + option),
        }))}
      />
      {(options?.assignType === assignChatType.AGENT ||
        options?.assignType === assignChatType.TEAM) && (
        <TextInput
          label={t('blocks.logic.assignChat.assigneeEmail')}
          defaultValue={options?.email}
          placeholder={t('blocks.logic.assignChat.assigneeEmail.placeholder')}
          type="email"
          onChange={handleEmailChange}
        />
      )}
    </Stack>
  )
}
