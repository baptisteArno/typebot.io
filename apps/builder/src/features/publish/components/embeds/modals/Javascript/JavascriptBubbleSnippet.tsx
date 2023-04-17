import prettier from 'prettier/standalone'
import parserHtml from 'prettier/parser-html'
import {
  parseApiHostValue,
  parseInitBubbleCode,
  typebotImportCode,
} from '../../snippetParsers'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import { BubbleProps } from '@typebot.io/js'

type Props = Pick<BubbleProps, 'theme' | 'previewMessage'>

export const JavascriptBubbleSnippet = ({ theme, previewMessage }: Props) => {
  const { typebot } = useTypebot()

  const snippet = prettier.format(
    `<script type="module">${typebotImportCode}
    
${parseInitBubbleCode({
  typebot: typebot?.publicId ?? '',
  apiHost: parseApiHostValue(typebot?.customDomain),
  theme: {
    ...theme,
    chatWindow: {
      backgroundColor: typebot?.theme.general.background.content ?? '#fff',
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
