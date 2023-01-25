import { FlexProps } from '@chakra-ui/react'
import { useTypebot } from '@/features/editor'
import { env, getViewerUrl } from 'utils'
import { CodeEditor } from '@/components/CodeEditor'

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
  const src = `${env('VIEWER_INTERNAL_URL') ?? getViewerUrl()}/${
    typebot?.publicId
  }`
  const code = `<iframe src="${src}" width="${widthLabel}" height="${heightLabel}" style="border: none"></iframe>`

  return <CodeEditor value={code} lang="html" isReadOnly />
}
