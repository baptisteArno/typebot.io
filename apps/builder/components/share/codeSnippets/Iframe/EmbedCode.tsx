import { FlexProps } from '@chakra-ui/react'
import { CodeEditor } from 'components/shared/CodeEditor'
import { useTypebot } from 'contexts/TypebotContext'

type Props = {
  widthLabel: string
  heightLabel: string
  onCopied?: () => void
}
export const IframeEmbedCode = ({
  widthLabel,
  heightLabel,
}: Props & FlexProps) => {
  const { typebot } = useTypebot()
  const src = `${
    process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_VIEWER_URL
  }/${typebot?.publicId}`
  const code = `<iframe src="${src}" width="${widthLabel}" height="${heightLabel}" />`

  return <CodeEditor value={code} lang="html" isReadOnly />
}
