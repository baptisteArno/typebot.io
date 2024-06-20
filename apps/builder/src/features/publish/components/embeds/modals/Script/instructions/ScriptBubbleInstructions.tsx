import { CodeEditor } from '@/components/inputs/CodeEditor'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { Stack, Text } from '@chakra-ui/react'
import { BubbleProps } from '@sniper.io/nextjs'
import { useState } from 'react'
import { BubbleSettings } from '../../../settings/BubbleSettings/BubbleSettings'
import {
  parseInlineScript,
  parseInitBubbleCode,
  sniperImportCode,
  parseApiHostValue,
} from '../../../snippetParsers'
import { parseDefaultBubbleTheme } from '../../Javascript/instructions/JavascriptBubbleInstructions'

export const ScriptBubbleInstructions = () => {
  const { sniper } = useSniper()
  const [theme, setTheme] = useState<BubbleProps['theme']>(
    parseDefaultBubbleTheme(sniper)
  )
  const [previewMessage, setPreviewMessage] =
    useState<BubbleProps['previewMessage']>()

  const scriptSnippet = parseInlineScript(
    `${sniperImportCode}

${parseInitBubbleCode({
  sniper: sniper?.publicId ?? '',
  apiHost: parseApiHostValue(sniper?.customDomain),
  theme,
  previewMessage,
})}`
  )

  return (
    <Stack spacing={4}>
      <BubbleSettings
        theme={theme}
        previewMessage={previewMessage}
        defaultPreviewMessageAvatar={sniper?.theme.chat?.hostAvatar?.url ?? ''}
        onThemeChange={setTheme}
        onPreviewMessageChange={setPreviewMessage}
      />
      <Text>Run this script to initialize the sniper:</Text>
      <CodeEditor isReadOnly value={scriptSnippet} lang="javascript" />
    </Stack>
  )
}
