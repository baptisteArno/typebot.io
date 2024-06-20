import { CodeEditor } from '@/components/inputs/CodeEditor'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { parseReactBotProps } from '../../snippetParsers'

type ReactStandardSnippetProps = { widthLabel?: string; heightLabel: string }

export const ReactStandardSnippet = ({
  widthLabel,
  heightLabel,
}: ReactStandardSnippetProps) => {
  const { sniper } = useSniper()
  const snippet = prettier.format(
    `import { Standard } from "@sniper.io/react";

      const App = () => {
        return <Standard ${parseReactBotProps({
          sniper: sniper?.publicId ?? '',
        })} style={{width: "${widthLabel}", height: "${heightLabel}"}} />
      }`,
    {
      parser: 'babel',
      plugins: [parserBabel],
    }
  )
  return <CodeEditor value={snippet} lang="javascript" isReadOnly />
}
