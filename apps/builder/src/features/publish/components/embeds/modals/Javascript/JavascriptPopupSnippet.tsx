import { useSniper } from '@/features/editor/providers/SniperProvider'
import parserHtml from 'prettier/parser-html'
import prettier from 'prettier/standalone'
import {
  parseApiHostValue,
  parseInitPopupCode,
  sniperImportCode,
} from '../../snippetParsers'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { PopupProps } from '@sniper.io/nextjs'

type Props = Pick<PopupProps, 'autoShowDelay'>

export const JavascriptPopupSnippet = ({ autoShowDelay }: Props) => {
  const { sniper } = useSniper()
  const snippet = prettier.format(
    createSnippet({
      sniper: sniper?.publicId ?? '',
      apiHost: parseApiHostValue(sniper?.customDomain),
      autoShowDelay,
    }),
    {
      parser: 'html',
      plugins: [parserHtml],
    }
  )
  return <CodeEditor value={snippet} lang="html" isReadOnly />
}

const createSnippet = (params: PopupProps): string => {
  const jsCode = parseInitPopupCode(params)
  return `<script type="module">${sniperImportCode}

${jsCode}</script>`
}
