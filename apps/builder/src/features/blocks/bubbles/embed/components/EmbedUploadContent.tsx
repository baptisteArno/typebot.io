import { TextInput, NumberInput } from '@/components/inputs'
import { Stack, Text } from '@chakra-ui/react'
import { EmbedBubbleBlock } from '@typebot.io/schemas'
import { sanitizeUrl } from '@typebot.io/lib'
import { useTranslate } from '@tolgee/react'
import { defaultEmbedBubbleContent } from '@typebot.io/schemas/features/blocks/bubbles/embed/constants'

type Props = {
  content: EmbedBubbleBlock['content']
  onSubmit: (content: EmbedBubbleBlock['content']) => void
}

export const EmbedUploadContent = ({ content, onSubmit }: Props) => {
  const { t } = useTranslate()
  const handleUrlChange = (url: string) => {
    const iframeUrl = sanitizeUrl(
      url.trim().startsWith('<iframe') ? extractUrlFromIframe(url) : url
    )
    onSubmit({ ...content, url: iframeUrl })
  }

  const handleHeightChange = (
    height?: NonNullable<EmbedBubbleBlock['content']>['height']
  ) => height && onSubmit({ ...content, height })

  return (
    <Stack p="2" spacing={6}>
      <Stack>
        <TextInput
          placeholder={t(
            'editor.blocks.bubbles.embed.settings.worksWith.placeholder'
          )}
          defaultValue={content?.url ?? ''}
          onChange={handleUrlChange}
        />
        <Text fontSize="sm" color="gray.400" textAlign="center">
          {t('editor.blocks.bubbles.embed.settings.worksWith.text')}
        </Text>
      </Stack>

      <NumberInput
        label="Height:"
        defaultValue={content?.height ?? defaultEmbedBubbleContent.height}
        onValueChange={handleHeightChange}
        suffix={t('editor.blocks.bubbles.embed.settings.numberInput.unit')}
        width="150px"
      />
    </Stack>
  )
}

const extractUrlFromIframe = (iframe: string) =>
  [...iframe.matchAll(/src="([^"]+)"/g)][0][1]
