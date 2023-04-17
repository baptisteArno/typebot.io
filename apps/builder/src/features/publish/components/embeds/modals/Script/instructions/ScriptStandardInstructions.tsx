import { CodeEditor } from '@/components/inputs/CodeEditor'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { Stack, Code, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { StandardSettings } from '../../../settings/StandardSettings'
import { parseInitStandardCode } from '../../../snippetParsers/standard'
import { parseStandardElementCode } from '../../Javascript/JavascriptStandardSnippet'
import {
  parseApiHostValue,
  parseInlineScript,
  typebotImportCode,
} from '../../../snippetParsers/shared'

export const ScriptStandardInstructions = () => {
  const { typebot } = useTypebot()
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

  const scriptSnippet = parseInlineScript(`${typebotImportCode}
  
${parseInitStandardCode({
  typebot: typebot?.publicId ?? '',
  apiHost: parseApiHostValue(typebot?.customDomain),
})}`)

  return (
    <Stack spacing={4}>
      <StandardSettings
        onUpdateWindowSettings={(settings) => setInputValues({ ...settings })}
      />
      <Text>
        Make sure you have this <Code>typebot-standard</Code> element in your{' '}
        <Code>{'<body>'}</Code>:
      </Text>
      <CodeEditor isReadOnly value={standardElementSnippet} lang="html" />
      <Text>Then, run this script to initialize the typebot:</Text>
      <CodeEditor isReadOnly value={scriptSnippet} lang="javascript" />
    </Stack>
  )
}
