import { FlexProps } from '@chakra-ui/react'
import { useSniper } from '@/features/editor/providers/SniperProvider'
import { CodeEditor } from '@/components/inputs/CodeEditor'
import prettier from 'prettier/standalone'
import parserHtml from 'prettier/parser-html'
import { env } from '@sniper.io/env'

type Props = {
  widthLabel: string
  heightLabel: string
  onCopied?: () => void
} & FlexProps

export const IframeSnippet = ({ widthLabel, heightLabel }: Props) => {
  const { sniper } = useSniper()
  const src = `${env.NEXT_PUBLIC_VIEWER_URL[0]}/${sniper?.publicId}`
  const code = prettier.format(
    `<iframe src="${src}" style="border: none; width: ${widthLabel}; height: ${heightLabel}"></iframe>`,
    { parser: 'html', plugins: [parserHtml] }
  )

  return <CodeEditor value={code} lang="html" isReadOnly />
}
