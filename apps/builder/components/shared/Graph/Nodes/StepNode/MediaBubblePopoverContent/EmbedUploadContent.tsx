import { HStack, Stack, Text } from '@chakra-ui/react'
import { SmartNumberInput } from 'components/shared/SmartNumberInput'
import { Input } from 'components/shared/Textbox/Input'
import { EmbedBubbleContent } from 'models'
import { sanitizeUrl } from 'utils'

type Props = {
  content: EmbedBubbleContent
  onSubmit: (content: EmbedBubbleContent) => void
}

export const EmbedUploadContent = ({ content, onSubmit }: Props) => {
  const handleUrlChange = (url: string) => {
    const iframeUrl = sanitizeUrl(
      url.trim().startsWith('<iframe') ? extractUrlFromIframe(url) : url
    )
    onSubmit({ ...content, url: iframeUrl })
  }

  const handleHeightChange = (height?: number) =>
    height && onSubmit({ ...content, height })

  return (
    <Stack p="2" spacing={6}>
      <Stack>
        <Input
          placeholder="Cole o link..."
          defaultValue={content?.url ?? ''}
          onChange={handleUrlChange}
        />
        <Text fontSize="sm" color="gray.400" textAlign="center">
          Funciona com PDFs, iframes, sites...
        </Text>
      </Stack>

      <HStack justify="space-between">
        <Text>Altura: </Text>
        <SmartNumberInput
          value={content?.height}
          onValueChange={handleHeightChange}
        />
      </HStack>
    </Stack>
  )
}

const extractUrlFromIframe = (iframe: string) =>
  [...iframe.matchAll(/src="([^"]+)"/g)][0][1]
