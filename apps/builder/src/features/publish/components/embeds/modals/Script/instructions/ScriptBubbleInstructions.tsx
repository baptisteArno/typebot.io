import { CodeEditor } from '@/components/CodeEditor'
import { useTypebot } from '@/features/editor'
import { isCloudProdInstance } from '@/utils/helpers'
import { Stack, Text } from '@chakra-ui/react'
import { BubbleProps } from '@typebot.io/js'
import { Typebot } from 'models'
import { useState } from 'react'
import { env, getViewerUrl } from 'utils'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import {
  parseInlineScript,
  parseInitBubbleCode,
  typebotImportCode,
} from '../../../snippetParsers'

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

export const ScriptBubbleInstructions = () => {
  const { typebot } = useTypebot()
  const [theme, setTheme] = useState<BubbleProps['theme']>(
    parseDefaultBubbleTheme(typebot)
  )
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps['previewMessage']>()

  const scriptSnippet = parseInlineScript(
    `${typebotImportCode}

${parseInitBubbleCode({
  typebot: typebot?.publicId ?? '',
  apiHost: isCloudProdInstance
    ? undefined
    : env('VIEWER_INTERNAL_URL') ?? getViewerUrl(),
  theme,
  previewMessage,
})}`
  )

  return (
    <Stack spacing={4}>
      <BubbleSettings
        theme={theme}
        previewMessage={previewMessage}
        defaultPreviewMessageAvatar={typebot?.theme.chat.hostAvatar?.url ?? ''}
        onThemeChange={setTheme}
        onPreviewMessageChange={setPreviewMessage}
      />
      <Text>Run this script to initialize the typebot:</Text>
      <CodeEditor isReadOnly value={scriptSnippet} lang="javascript" />
    </Stack>
  )
}
