import parserHtml from 'prettier/parser-html'
import prettier from 'prettier/standalone'
import {
  parseApiHostValue,
  parseInitStandardCode,
  sniperImportCode,
} from '../../snippetParsers'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { CodeEditor } from '@/components/inputs/CodeEditor'

type Props = {
  widthLabel?: string
  heightLabel?: string
}

export const JavascriptStandardSnippet = ({
  widthLabel,
  heightLabel,
}: Props) => {
  const { sniper } = useSniper()

  const snippet = prettier.format(
    `${parseStandardHeadCode(sniper?.publicId, sniper?.customDomain)}
      ${parseStandardElementCode(widthLabel, heightLabel)}`,
    {
      parser: 'html',
      plugins: [parserHtml],
    }
  )

  return <CodeEditor value={snippet} lang="html" isReadOnly />
}

export const parseStandardHeadCode = (
  publicId?: string | null,
  customDomain?: string | null
) =>
  prettier.format(
    `<script type="module">${sniperImportCode};

${parseInitStandardCode({
  sniper: publicId ?? '',
  apiHost: parseApiHostValue(customDomain),
})}</script>`,
    { parser: 'html', plugins: [parserHtml] }
  )

export const parseStandardElementCode = (width?: string, height?: string) => {
  if (!width && !height) return '<sniper-standard></sniper-standard>'
  return prettier.format(
    `<sniper-standard style="${width ? `width: ${width}; ` : ''}${
      height ? `height: ${height}; ` : ''
    }"></sniper-standard>`,
    { parser: 'html', plugins: [parserHtml] }
  )
}
