import prettier from 'prettier/standalone'
import parserHtml from 'prettier/parser-html'
import { BubbleParams } from 'typebot-js'
import { parseInitBubbleCode, typebotJsHtml } from '../params'
import { useTypebot } from '@/features/editor'
import { CodeEditor } from '@/components/CodeEditor'
import { env, getViewerUrl } from 'utils'
import { FlexProps } from '@chakra-ui/react'

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
      url: `${env('VIEWER_INTERNAL_URL') ?? getViewerUrl()}/${
        typebot?.publicId
      }`,
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
