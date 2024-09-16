import { useTranslate } from '@tolgee/react'
import { Box, Text } from '@chakra-ui/react'
import { VideoBubbleBlock } from '@typebot.io/schemas'
import {
  VideoBubbleContentType,
  embedBaseUrls,
} from '@typebot.io/schemas/features/blocks/bubbles/video/constants'
import { VariableTag } from '@/features/graph/components/nodes/block/VariableTag'
import { findUniqueVariable } from '@typebot.io/variables/findUniqueVariableValue'
import { useTypebot } from '@/features/editor/providers/TypebotProvider'

type Props = {
  block: VideoBubbleBlock
}

export const VideoBubbleContent = ({ block }: Props) => {
  const { typebot } = useTypebot()
  const { t } = useTranslate()
  if (!block.content?.url || !block.content.type)
    return <Text color="gray.500">{t('clickToEdit')}</Text>
  const variable = typebot
    ? findUniqueVariable(typebot?.variables)(block.content?.url)
    : null
  switch (block.content.type) {
    case VideoBubbleContentType.URL:
      return (
        <Box w="full" h={variable ? undefined : ' 120px'} pos="relative">
          {variable ? (
            <Text>
              Display <VariableTag variableName={variable.name} />
            </Text>
          ) : (
            <video
              key={block.content.url}
              controls={block.content?.areControlsDisplayed}
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
    case VideoBubbleContentType.GUMLET:
    case VideoBubbleContentType.VIMEO:
    case VideoBubbleContentType.YOUTUBE: {
      const baseUrl = embedBaseUrls[block.content.type]
      return (
        <Box w="full" h="120px" pos="relative">
          <iframe
            src={`${baseUrl}/${block.content.id}`}
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
    case VideoBubbleContentType.TIKTOK: {
      return (
        <Box w="full" h="300px" pos="relative">
          <iframe
            src={`https://www.tiktok.com/embed/v2/${block.content.id}`}
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
