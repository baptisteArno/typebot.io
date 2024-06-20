import { CodeEditor } from '@/components/inputs/CodeEditor'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { PopupSettings } from '../../../settings/PopupSettings'
import { parseInitPopupCode } from '../../../snippetParsers'
import {
  parseApiHostValue,
  parseInlineScript,
  sniperImportCode,
} from '../../../snippetParsers/shared'

export const ScriptPopupInstructions = () => {
  const { sniper } = useSniper()
  const [inputValue, setInputValue] = useState<number>()

  const scriptSnippet = parseInlineScript(
    `${sniperImportCode}

${parseInitPopupCode({
  sniper: sniper?.publicId ?? '',
  apiHost: parseApiHostValue(sniper?.customDomain),
  autoShowDelay: inputValue,
})}`
  )

  return (
    <Stack spacing={4}>
      <PopupSettings
        onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)}
      />
      <Text>Run this script to initialize the sniper:</Text>
      <CodeEditor isReadOnly value={scriptSnippet} lang="javascript" />
    </Stack>
  )
}
