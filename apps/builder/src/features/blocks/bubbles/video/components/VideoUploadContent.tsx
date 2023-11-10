import { Stack, Text } from '@chakra-ui/react'
import { VideoBubbleBlock } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'
import { useTranslate } from '@tolgee/react'
import { parseVideoUrl } from '@typebot.io/lib/parseVideoUrl'
import { defaultVideoBubbleContent } from '@typebot.io/schemas/features/blocks/bubbles/video/constants'

type Props = {
  content?: VideoBubbleBlock['content']
  onSubmit: (content: VideoBubbleBlock['content']) => void
}

export const VideoUploadContent = ({ content, onSubmit }: Props) => {
  const { t } = useTranslate()
  const updateUrl = (url: string) => {
    const {
      type,
      url: matchedUrl,
      id,
      videoSizeSuggestion,
    } = parseVideoUrl(url)
    return onSubmit({
      ...content,
      type,
      url: matchedUrl,
      id,
      ...(!content?.aspectRatio && !content?.maxWidth
        ? videoSizeSuggestion
        : {}),
    })
  }
  const updateAspectRatio = (aspectRatio?: string) => {
    return onSubmit({
      ...content,
      aspectRatio,
    })
  }

  const updateMaxWidth = (maxWidth?: string) => {
    return onSubmit({
      ...content,
      maxWidth,
    })
  }

  return (
    <Stack p="2" spacing={4}>
      <Stack>
        <TextInput
          placeholder={t('video.urlInput.placeholder')}
          defaultValue={content?.url ?? ''}
          onChange={updateUrl}
        />
        <Text fontSize="xs" color="gray.400" textAlign="center">
          {t('video.urlInput.helperText')}
        </Text>
      </Stack>
      {content?.url && (
        <Stack>
          <TextInput
            label={t('video.aspectRatioInput.label')}
            moreInfoTooltip={t('video.aspectRatioInput.moreInfoTooltip')}
            defaultValue={
              content?.aspectRatio ?? defaultVideoBubbleContent.aspectRatio
            }
            onChange={updateAspectRatio}
            direction="row"
          />
          <TextInput
            label={t('video.maxWidthInput.label')}
            moreInfoTooltip={t('video.maxWidthInput.moreInfoTooltip')}
            defaultValue={
              content?.maxWidth ?? defaultVideoBubbleContent.maxWidth
            }
            onChange={updateMaxWidth}
            direction="row"
          />
        </Stack>
      )}
    </Stack>
  )
}
