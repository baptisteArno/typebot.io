import { CodeEditor } from '@/components/inputs/CodeEditor'
import { useTypebot } from '@/features/editor'
import { isCloudProdInstance } from '@/utils/helpers'
import { Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { env, getViewerUrl } from 'utils'
import { PopupSettings } from '../../../settings/PopupSettings'
import { parseInitPopupCode } from '../../../snippetParsers'
import {
  parseInlineScript,
  typebotImportCode,
} from '../../../snippetParsers/shared'

export const ScriptPopupInstructions = () => {
  const { typebot } = useTypebot()
  const [inputValue, setInputValue] = useState<number>()

  const scriptSnippet = parseInlineScript(
    `${typebotImportCode}

${parseInitPopupCode({
  typebot: typebot?.publicId ?? '',
  apiHost: isCloudProdInstance
    ? undefined
    : env('VIEWER_INTERNAL_URL') ?? getViewerUrl(),
  autoShowDelay: inputValue,
})}`
  )

  return (
    <Stack spacing={4}>
      <PopupSettings
        onUpdateSettings={(settings) => setInputValue(settings.autoShowDelay)}
      />
      <Text>Run this script to initialize the typebot:</Text>
      <CodeEditor isReadOnly value={scriptSnippet} lang="javascript" />
    </Stack>
  )
}
