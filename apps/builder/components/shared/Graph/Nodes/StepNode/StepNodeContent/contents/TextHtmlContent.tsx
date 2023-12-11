import { Flex } from '@chakra-ui/react'
import { useTypebot } from 'contexts/TypebotContext'
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
  return !renderIfEmpty && !html ? (
    <></>
  ) : (
    <Flex
      w="90%"
      flexDir={'column'}
      opacity={html === '' ? '0.5' : '1'}
      className="slate-html-container"
      dangerouslySetInnerHTML={{
        __html:
          html && typebot
            ? parseVariableHighlight(html, typebot)
            : `<p>${defaultPlaceholder || 'Configurar...'}</p>`,
      }}
      fontSize={fontSize}
    />
  )
}
