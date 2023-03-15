import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Stack, Code, Text } from '@chakra-ui/react'
import { BubbleProps } from '@typebot.io/js'
import { Typebot } from '@typebot.io/schemas'
import { useState } from 'react'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import { JavascriptBubbleSnippet } from '../JavascriptBubbleSnippet'

export const parseDefaultBubbleTheme = (typebot?: Typebot) => ({
  button: {
    backgroundColor: typebot?.theme.chat.buttons.backgroundColor,
    iconColor: typebot?.theme.chat.buttons.color,
  },
  previewMessage: {
    backgroundColor: typebot?.theme.general.background.content ?? 'white',
    textColor: 'black',
  },
})

export const JavascriptBubbleInstructions = () => {
  const { typebot } = useTypebot()
  const [theme, setTheme] = useState<BubbleProps['theme']>(
    parseDefaultBubbleTheme(typebot)
  )
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps['previewMessage']>()

  return (
    <Stack spacing={4}>
      <BubbleSettings
        theme={theme}
        previewMessage={previewMessage}
        defaultPreviewMessageAvatar={typebot?.theme.chat.hostAvatar?.url ?? ''}
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
