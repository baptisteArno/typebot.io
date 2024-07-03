import { Flex } from '@chakra-ui/react'
import { textBubbleEditorContentConfig } from 'config/dompurify'
import { useTypebot } from 'contexts/TypebotContext'
import DOMPurify from 'dompurify'
import { parseVariableHighlight } from 'services/utils'

type Props = {
  html?: string
  defaultPlaceholder?: string
  renderIfEmpty?: boolean
  fontSize?: string
}

export const TextHtmlContent = ({
  html,
  defaultPlaceholder,
  renderIfEmpty = true,
  fontSize,
}: Props) => {
  const { typebot } = useTypebot()
  const sanitizedHtml = DOMPurify.sanitize(html, textBubbleEditorContentConfig)

  return !renderIfEmpty && !sanitizedHtml ? (
    <></>
  ) : (
    <Flex
      w="90%"
      flexDir={'column'}
      opacity={html === '' ? '0.5' : '1'}
      className="slate-html-container"
      dangerouslySetInnerHTML={{
        __html:
          sanitizedHtml && typebot
            ? parseVariableHighlight(sanitizedHtml, typebot)
            : `<p>${defaultPlaceholder || 'Configurar...'}</p>`,
      }}
      fontSize={fontSize}
    />
  )
}
