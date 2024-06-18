import prettier from 'prettier/standalone'
import parserHtml from 'prettier/parser-html'
import {
  parseApiHostValue,
  parseInitBubbleCode,
  sniperImportCode,
} from '../../snippetParsers'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { BubbleProps } from '@sniper.io/nextjs'

type Props = Pick<BubbleProps, 'theme' | 'previewMessage'>

export const JavascriptBubbleSnippet = ({ theme, previewMessage }: Props) => {
  const { sniper } = useSniper()

  const snippet = prettier.format(
    `<script type="module">${sniperImportCode}
    
${parseInitBubbleCode({
  sniper: sniper?.publicId ?? '',
  apiHost: parseApiHostValue(sniper?.customDomain),
  theme: {
    ...theme,
    chatWindow: {
      backgroundColor: sniper?.theme.general?.background?.content ?? '#fff',
    },
  },
  previewMessage,
})}</script>`,
    {
      parser: 'html',
      plugins: [parserHtml],
    }
  )

  return <CodeEditor value={snippet} lang="html" isReadOnly />
}
