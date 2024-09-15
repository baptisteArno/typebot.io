import React from 'react'
import { Text } from '@chakra-ui/react'
import { useTranslate } from '@tolgee/react'

export const CloseChatNodeBody = () => {
  const { t } = useTranslate()
  return <Text> {t('blocks.logic.closeChat.closeChat')} </Text>
}
