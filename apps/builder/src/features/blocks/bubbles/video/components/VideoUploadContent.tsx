import { Stack, Text } from '@chakra-ui/react'
import { VideoBubbleBlock } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'
import { useTranslate } from '@tolgee/react'
import { parseVideoUrl } from '@typebot.io/schemas/features/blocks/bubbles/video/helpers'
import { defaultVideoBubbleContent } from '@typebot.io/schemas/features/blocks/bubbles/video/constants'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'

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

  const updateAutoPlay = (isAutoplayEnabled: boolean) => {
    return onSubmit({ ...content, isAutoplayEnabled })
  }

  const updateControlsDisplay = (areControlsDisplayed: boolean) => {
    if (areControlsDisplayed === false) {
      // Make sure autoplay is enabled when video controls are disabled
      return onSubmit({
        ...content,
        isAutoplayEnabled: true,
        areControlsDisplayed,
      })
    }
    return onSubmit({ ...content, areControlsDisplayed })
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
      {content?.url && content?.type === 'url' && (
        <Stack>
          <SwitchWithLabel
            label={'Display controls'}
            initialValue={
              content?.areControlsDisplayed ??
              defaultVideoBubbleContent.areControlsDisplayed
            }
            onCheckChange={updateControlsDisplay}
          />
          <SwitchWithLabel
            label={t('editor.blocks.bubbles.audio.settings.autoplay.label')}
            initialValue={
              content?.isAutoplayEnabled ??
              defaultVideoBubbleContent.isAutoplayEnabled
            }
            isChecked={
              content?.isAutoplayEnabled ??
              defaultVideoBubbleContent.isAutoplayEnabled
            }
            isDisabled={content?.areControlsDisplayed === false}
            onCheckChange={() => updateAutoPlay(!content.isAutoplayEnabled)}
          />
        </Stack>
      )}
    </Stack>
  )
}
