import { Stack, Flex, Text } from '@chakra-ui/react'
import { ContainerColors } from '@typebot.io/schemas'
import React from 'react'
import { ColorPicker } from '../../../../components/ColorPicker'
import { defaultTheme } from '@typebot.io/schemas/features/typebot/theme/constants'
import { useTranslate } from '@tolgee/react'

type Props = {
  hostBubbles: ContainerColors | undefined
  onHostBubblesChange: (hostBubbles: ContainerColors | undefined) => void
}

export const HostBubbles = ({ hostBubbles, onHostBubblesChange }: Props) => {
  const { t } = useTranslate()

  const handleBackgroundChange = (backgroundColor: string) =>
    onHostBubblesChange({ ...hostBubbles, backgroundColor })
  const handleTextChange = (color: string) =>
    onHostBubblesChange({ ...hostBubbles, color })

  return (
    <Stack data-testid="host-bubbles-theme">
      <Flex justify="space-between" align="center">
        <Text>{t('theme.sideMenu.chat.theme.background')}</Text>
        <ColorPicker
          value={
            hostBubbles?.backgroundColor ??
            defaultTheme.chat.hostBubbles.backgroundColor
          }
          onColorChange={handleBackgroundChange}
        />
      </Flex>
      <Flex justify="space-between" align="center">
        <Text>{t('theme.sideMenu.chat.theme.text')}</Text>
        <ColorPicker
          value={hostBubbles?.color ?? defaultTheme.chat.hostBubbles.color}
          onColorChange={handleTextChange}
        />
      </Flex>
    </Stack>
  )
}
