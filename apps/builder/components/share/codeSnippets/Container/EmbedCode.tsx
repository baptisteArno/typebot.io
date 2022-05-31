import { FlexProps } from '@chakra-ui/react'
import parserHtml from 'prettier/parser-html'
import prettier from 'prettier/standalone'
import { parseInitContainerCode, typebotJsHtml } from '../params'
import { IframeParams } from 'typebot-js'
import { useTypebot } from 'contexts/TypebotContext'
import { CodeEditor } from 'components/shared/CodeEditor'
import { isEmpty } from 'utils'

type ContainerEmbedCodeProps = {
  widthLabel: string
  heightLabel: string
  withStarterVariables?: boolean
  onCopied?: () => void
}

export const ContainerEmbedCode = ({
  widthLabel,
  heightLabel,
}: ContainerEmbedCodeProps & FlexProps) => {
  const { typebot } = useTypebot()

  const snippet = prettier.format(
    parseSnippet({
      url: `${
        isEmpty(process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL)
          ? process.env.NEXT_PUBLIC_VIEWER_URL
          : process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL
      }/${typebot?.publicId}`,
      heightLabel,
      widthLabel,
    }),
    {
      parser: 'html',
      plugins: [parserHtml],
    }
  )

  return <CodeEditor value={snippet} lang="html" isReadOnly />
}

type SnippetProps = IframeParams &
  Pick<ContainerEmbedCodeProps, 'widthLabel' | 'heightLabel'>

const parseSnippet = ({
  url,
  customDomain,
  backgroundColor,
  hiddenVariables,
  ...embedProps
}: SnippetProps): string => {
  const jsCode = parseInitContainerCode({
    customDomain,
    hiddenVariables,
    backgroundColor,
    url,
  })
  return `${typebotJsHtml}
      <div id="typebot-container" style="width: ${embedProps.widthLabel}; height: ${embedProps.heightLabel};"></div>
      <script>${jsCode}</script>`
}
