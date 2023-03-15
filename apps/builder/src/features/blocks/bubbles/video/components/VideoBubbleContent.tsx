import { Box, Text } from '@chakra-ui/react'
import { VideoBubbleBlock, VideoBubbleContentType } from '@typebot.io/schemas'

export const VideoBubbleContent = ({ block }: { block: VideoBubbleBlock }) => {
  if (!block.content?.url || !block.content.type)
    return <Text color="gray.500">Click to edit...</Text>
  switch (block.content.type) {
    case VideoBubbleContentType.URL:
      return (
        <Box w="full" h="120px" pos="relative">
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
