import React from 'react'
import { Tag, Text } from '@chakra-ui/react'
import { AssignChatBlock } from '@typebot.io/schemas'
import { assignChatType } from '@typebot.io/schemas/features/blocks/logic/assignChat/constants'
import { useTranslate } from '@tolgee/react'

type Props = {
  options: AssignChatBlock['options']
}

export const AssignChatNodeContent = ({ options }: Props) => {
  const { t } = useTranslate()
  const assignType: assignChatType = options?.assignType
  const email: string = options?.email || ''
  const name: string = options?.name || ''

  return (
    <Text color="currentcolor" noOfLines={2}>
      {t('blocks.logic.assignChat.assignTo')}{' '}
      {assignType && <Tag>{t('blocks.logic.assignChat.' + assignType)}</Tag>}{' '}
      {email && email} {name && name}
    </Text>
  )
}
