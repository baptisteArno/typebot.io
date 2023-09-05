import { TextInput, NumberInput } from '@/components/inputs'
import { HStack, Stack, Text } from '@chakra-ui/react'
import { EmbedBubbleContent } from '@typebot.io/schemas'
import { sanitizeUrl } from '@typebot.io/lib'
import { useScopedI18n } from '@/locales'

type Props = {
  content: EmbedBubbleContent
  onSubmit: (content: EmbedBubbleContent) => void
}

export const EmbedUploadContent = ({ content, onSubmit }: Props) => {
  const scopedT = useScopedI18n('editor.blocks.bubbles.embed.settings')
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
          placeholder={scopedT('worksWith.placeholder')}
          defaultValue={content?.url ?? ''}
          onChange={handleUrlChange}
        />
        <Text fontSize="sm" color="gray.400" textAlign="center">
          {scopedT('worksWith.text')}
        </Text>
      </Stack>

      <HStack>
        <NumberInput
          label="Height:"
          defaultValue={content?.height}
          onValueChange={handleHeightChange}
        />
        <Text>{scopedT('numberInput.unit')}</Text>
      </HStack>
    </Stack>
  )
}

const extractUrlFromIframe = (iframe: string) =>
  [...iframe.matchAll(/src="([^"]+)"/g)][0][1]
