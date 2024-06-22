import { CodeEditor } from '@/components/inputs/CodeEditor'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { Stack, Code, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { StandardSettings } from '../../../settings/StandardSettings'
import { parseInitStandardCode } from '../../../snippetParsers/standard'
import { parseStandardElementCode } from '../../Javascript/JavascriptStandardSnippet'
import {
  parseApiHostValue,
  parseInlineScript,
  sniperImportCode,
} from '../../../snippetParsers/shared'

export const ScriptStandardInstructions = () => {
  const { sniper } = useSniper()
  const [inputValues, setInputValues] = useState<{
    heightLabel: string
    widthLabel?: string
  }>({
    heightLabel: '100%',
    widthLabel: '100%',
  })

  const standardElementSnippet = parseStandardElementCode(
    inputValues.widthLabel,
    inputValues.heightLabel
  )

  const scriptSnippet = parseInlineScript(`${sniperImportCode}
  
${parseInitStandardCode({
  sniper: sniper?.publicId ?? '',
  apiHost: parseApiHostValue(sniper?.customDomain),
})}`)

  return (
    <Stack spacing={4}>
      <StandardSettings
        onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
      />
      <Text>
        Make sure you have this <Code>sniper-standard</Code> element in your{' '}
        <Code>{'<body>'}</Code>:
      </Text>
      <CodeEditor isReadOnly value={standardElementSnippet} lang="html" />
      <Text>Then, run this script to initialize the sniper:</Text>
      <CodeEditor isReadOnly value={scriptSnippet} lang="javascript" />
    </Stack>
  )
}
