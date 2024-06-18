import { CodeEditor } from '@/components/inputs/CodeEditor'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { BubbleProps } from '@sniper.io/nextjs'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import { parseReactBubbleProps } from '../../snippetParsers'

export const ReactBubbleSnippet = ({
  theme,
  previewMessage,
}: Pick<BubbleProps, 'theme' | 'previewMessage'>) => {
  const { sniper } = useSniper()

  const snippet = prettier.format(
    `import { Bubble } from "@sniper.io/react";

      const App = () => {
        return <Bubble ${parseReactBubbleProps({
          sniper: sniper?.publicId ?? '',
          theme,
          previewMessage,
        })}/>
      }`,
    {
      parser: 'babel',
      plugins: [parserBabel],
    }
  )

  return <CodeEditor value={snippet} lang="javascript" isReadOnly />
}
