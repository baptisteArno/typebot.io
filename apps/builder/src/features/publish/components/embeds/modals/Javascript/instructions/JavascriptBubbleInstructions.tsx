import { useSniper } from '@/features/editor/providers/SniperProvider'
import { Stack, Code, Text } from '@chakra-ui/react'
import { BubbleProps } from '@sniper.io/nextjs'
import { Sniper } from '@sniper.io/schemas'
import { useState } from 'react'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import { JavascriptBubbleSnippet } from '../JavascriptBubbleSnippet'
import { defaultButtonsBackgroundColor } from '@sniper.io/schemas/features/sniper/theme/constants'

export const parseDefaultBubbleTheme = (sniper?: Sniper) => ({
  button: {
    backgroundColor:
      sniper?.theme.chat?.buttons?.backgroundColor ??
      defaultButtonsBackgroundColor,
  },
})

export const JavascriptBubbleInstructions = () => {
  const { sniper } = useSniper()
  const [theme, setTheme] = useState<BubbleProps['theme']>(
    parseDefaultBubbleTheme(sniper)
  )
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps['previewMessage']>()

  return (
    <Stack spacing={4}>
      <BubbleSettings
        theme={theme}
        previewMessage={previewMessage}
        defaultPreviewMessageAvatar={sniper?.theme.chat?.hostAvatar?.url ?? ''}
        onThemeChange={setTheme}
        onPreviewMessageChange={setPreviewMessage}
      />
      <Text>
        Paste this anywhere in the <Code>{'<body>'}</Code>:
      </Text>
      <JavascriptBubbleSnippet theme={theme} previewMessage={previewMessage} />
    </Stack>
  )
}
