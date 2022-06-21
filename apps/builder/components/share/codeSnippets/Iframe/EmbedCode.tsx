import { FlexProps } from '@chakra-ui/react'
import { CodeEditor } from 'components/shared/CodeEditor'
import { useTypebot } from 'contexts/TypebotContext'
import { env, isEmpty } from 'utils'

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
    isEmpty(env('VIEWER_INTERNAL_URL'))
      ? env('VIEWER_URL')
      : env('VIEWER_INTERNAL_URL')
  }/${typebot?.publicId}`
  const code = `<iframe src="${src}" width="${widthLabel}" height="${heightLabel}" />`

  return <CodeEditor value={code} lang="html" isReadOnly />
}
