import { TextInput, NumberInput } from '@/components/inputs'
import { HStack, Stack, Text } from '@chakra-ui/react'
import { EmbedBubbleContent } from '@typebot.io/schemas'
import { sanitizeUrl } from '@typebot.io/lib'
import { I18nFunction } from '@/locales'

type Props = {
  scopedT: I18nFunction
  content: EmbedBubbleContent
  onSubmit: (content: EmbedBubbleContent) => void
}

export const EmbedUploadContent = ({ scopedT, content, onSubmit }: Props) => {
  const handleUrlChange = (url: string) => {
    const iframeUrl = sanitizeUrl(
      url.trim().startsWith('<iframe') ? extractUrlFromIframe(url) : url
    )
    onSubmit({ ...content, url: iframeUrl })
  }

  const handleHeightChange = (height?: EmbedBubbleContent['height']) =>
    height && onSubmit({ ...content, height })

  return (
    <Stack p="2" spacing={6}>
      <Stack>
        <TextInput
          placeholder={scopedT('bubbles.embed.worksWith.placeholder')}
          defaultValue={content?.url ?? ''}
          onChange={handleUrlChange}
        />
        <Text fontSize="sm" color="gray.400" textAlign="center">
          {scopedT('bubbles.embed.worksWith.text')}
        </Text>
      </Stack>

      <HStack>
        <NumberInput
          label="Height:"
          defaultValue={content?.height}
          onValueChange={handleHeightChange}
        />
        <Text>{scopedT('bubbles.embed.numberInput.unit')}</Text>
      </HStack>
    </Stack>
  )
}

const extractUrlFromIframe = (iframe: string) =>
  [...iframe.matchAll(/src="([^"]+)"/g)][0][1]
