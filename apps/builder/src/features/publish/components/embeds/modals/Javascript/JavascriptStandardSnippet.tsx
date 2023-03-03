import parserHtml from 'prettier/parser-html'
import prettier from 'prettier/standalone'
import { parseInitStandardCode, typebotImportCode } from '../../snippetParsers'
import { useTypebot } from '@/features/editor'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { isCloudProdInstance } from '@/utils/helpers'
import { env, getViewerUrl } from 'utils'

type Props = {
  widthLabel?: string
  heightLabel?: string
}

export const JavascriptStandardSnippet = ({
  widthLabel,
  heightLabel,
}: Props) => {
  const { typebot } = useTypebot()

  const snippet = prettier.format(
    `${parseStandardHeadCode(typebot?.publicId)}
      ${parseStandardElementCode(widthLabel, heightLabel)}`,
    {
      parser: 'html',
      plugins: [parserHtml],
    }
  )

  return <CodeEditor value={snippet} lang="html" isReadOnly />
}

export const parseStandardHeadCode = (publicId?: string | null) =>
  prettier.format(
    `<script type="module">${typebotImportCode};

${parseInitStandardCode({
  typebot: publicId ?? '',
  apiHost: isCloudProdInstance
    ? undefined
    : env('VIEWER_INTERNAL_URL') ?? getViewerUrl(),
})}</script>`,
    { parser: 'html', plugins: [parserHtml] }
  )

export const parseStandardElementCode = (width?: string, height?: string) => {
  if (!width && !height) return '<typebot-standard></typebot-standard>'
  return prettier.format(
    `<typebot-standard style="${width ? `width: ${width}; ` : ''}${
      height ? `height: ${height}; ` : ''
    }"></typebot-standard>`,
    { parser: 'html', plugins: [parserHtml] }
  )
}
