import { FlexProps } from '@chakra-ui/layout'
import prettier from 'prettier/standalone'
import parserHtml from 'prettier/parser-html'
import { BubbleParams } from 'typebot-js'
import { parseInitBubbleCode, typebotJsHtml } from '../params'
import { useTypebot } from 'contexts/TypebotContext'
import { CodeEditor } from 'components/shared/CodeEditor'

type ChatEmbedCodeProps = {
  withStarterVariables?: boolean
  onCopied?: () => void
} & Pick<BubbleParams, 'button' | 'proactiveMessage'>

export const ChatEmbedCode = ({
  proactiveMessage,
  button,
}: ChatEmbedCodeProps & FlexProps) => {
  const { typebot } = useTypebot()

  const snippet = prettier.format(
    createSnippet({
      url: `${process.env.NEXT_PUBLIC_VIEWER_URL}/${typebot?.publicId}`,
      button,
      proactiveMessage,
    }),
    {
      parser: 'html',
      plugins: [parserHtml],
    }
  )
  return <CodeEditor value={snippet} lang="html" isReadOnly />
}

const createSnippet = (params: BubbleParams): string => {
  const jsCode = parseInitBubbleCode(params)
  return `${typebotJsHtml}
  <script>${jsCode}</script>`
}
