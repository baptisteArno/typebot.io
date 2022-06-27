import { Box, Text } from '@chakra-ui/react'
import { VideoBubbleStep, VideoBubbleContentType } from 'models'

export const VideoBubbleContent = ({ step }: { step: VideoBubbleStep }) => {
  if (!step.content?.url || !step.content.type)
    return <Text color="gray.500">Clique para editar...</Text>
  switch (step.content.type) {
    case VideoBubbleContentType.URL:
      return (
        <Box w="full" h="120px" pos="relative">
          <video
            key={step.content.url}
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
            <source src={step.content.url} />
          </video>
        </Box>
      )
    case VideoBubbleContentType.VIMEO:
    case VideoBubbleContentType.YOUTUBE: {
      const baseUrl =
        step.content.type === VideoBubbleContentType.VIMEO
          ? 'https://player.vimeo.com/video'
          : 'https://www.youtube.com/embed'
      return (
        <Box w="full" h="120px" pos="relative">
          <iframe
            src={`${baseUrl}/${step.content.id}`}
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
