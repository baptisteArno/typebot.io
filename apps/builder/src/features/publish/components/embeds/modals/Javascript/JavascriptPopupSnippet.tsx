import { useTypebot } from '@/features/editor'
import parserHtml from 'prettier/parser-html'
import prettier from 'prettier/standalone'
import { parseInitPopupCode } from '../../snippetParsers'
import { CodeEditor } from '@/components/CodeEditor'
import { PopupProps } from '@typebot.io/js'
import { isCloudProdInstance } from '@/utils/helpers'
import { env, getViewerUrl } from 'utils'

type Props = Pick<PopupProps, 'autoShowDelay'>

export const JavascriptPopupSnippet = ({ autoShowDelay }: Props) => {
  const { typebot } = useTypebot()
  const snippet = prettier.format(
    createSnippet({
      typebot: typebot?.publicId ?? '',
      apiHost: isCloudProdInstance
        ? undefined
        : env('VIEWER_INTERNAL_URL') ?? getViewerUrl(),
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
  return `<script type="module">${jsCode}</script>`
}
