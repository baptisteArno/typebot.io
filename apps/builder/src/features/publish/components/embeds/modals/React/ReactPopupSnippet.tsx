import { CodeEditor } from '@/components/inputs/CodeEditor'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { PopupProps } from '@sniper.io/nextjs'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { parseReactPopupProps } from '../../snippetParsers'

export const ReactPopupSnippet = ({
  autoShowDelay,
}: Pick<PopupProps, 'autoShowDelay'>) => {
  const { sniper } = useSniper()

  const snippet = prettier.format(
    `import { Popup } from "@sniper.io/react";

      const App = () => {
        return <Popup ${parseReactPopupProps({
          sniper: sniper?.publicId ?? '',
          autoShowDelay,
        })}/>;
      }`,
    {
      parser: 'babel',
      plugins: [parserBabel],
    }
  )

  return <CodeEditor value={snippet} lang="javascript" isReadOnly />
}
