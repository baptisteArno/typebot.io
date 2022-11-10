import { FlexProps } from '@chakra-ui/react'
import { CodeEditor } from 'components/shared/CodeEditor'
import { useTypebot } from 'contexts/TypebotContext'
import { env, getViewerUrl } from 'utils'

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
    env('VIEWER_INTERNAL_URL') ?? getViewerUrl({ isBuilder: true })
  }/${typebot?.publicId}`
  const code = `<iframe src="${src}" width="${widthLabel}" height="${heightLabel}" style="border: none"></iframe>`

  return <CodeEditor value={code} lang="html" isReadOnly />
}
