import { useTranslate } from '@tolgee/react'
import { Box, Text, Image } from '@chakra-ui/react'
import { VideoBubbleBlock } from '@typebot.io/schemas'
import { VideoBubbleContentType } from '@typebot.io/schemas/features/blocks/bubbles/video/constants'

type Props = {
  block: VideoBubbleBlock
}

export const VideoBubbleContent = ({ block }: Props) => {
  const { t } = useTranslate()
  if (!block.content?.url || !block.content.type)
    return (
      <Text color="gray.500">
        {t('editor.blocks.bubbles.video.node.clickToEdit.text')}
      </Text>
    )
  const containsVariables =
    block.content?.url?.includes('{{') && block.content.url.includes('}}')
  switch (block.content.type) {
    case VideoBubbleContentType.URL:
      return (
        <Box w="full" h="120px" pos="relative">
          {containsVariables ? (
            <Image
              src="/images/dynamic-image.png"
              alt="Dynamic video thumbnail"
              rounded="md"
            />
          ) : (
            <video
              key={block.content.url}
              controls
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                left: '0',
                top: '0',
                borderRadius: '10px',
              }}
            >
              <source src={block.content.url} />
            </video>
          )}
        </Box>
      )
    case VideoBubbleContentType.VIMEO:
    case VideoBubbleContentType.YOUTUBE: {
      const baseUrl =
        block.content.type === VideoBubbleContentType.VIMEO
          ? 'https://player.vimeo.com/video'
          : 'https://www.youtube.com/embed'
      return (
        <Box w="full" h="120px" pos="relative">
          <iframe
            src={`${baseUrl}/${block.content.id}`}
            allowFullScreen
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              left: '0',
              top: '0',
              borderRadius: '10px',
              pointerEvents: 'none',
            }}
          />
        </Box>
      )
    }
  }
}
