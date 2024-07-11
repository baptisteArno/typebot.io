import { Button, HStack, Stack, Text } from '@chakra-ui/react'
import { VideoBubbleBlock } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'
import { useTranslate } from '@tolgee/react'
import { parseVideoUrl } from '@typebot.io/schemas/features/blocks/bubbles/video/helpers'
import { defaultVideoBubbleContent } from '@typebot.io/schemas/features/blocks/bubbles/video/constants'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { useState } from 'react'

type Tabs = 'link' | 'pexels'

type Props = {
  content?: VideoBubbleBlock['content']
  onSubmit: (content: VideoBubbleBlock['content']) => void
  initialTab?: Tabs
} & (
  | {
      includedTabs?: Tabs[]
    }
  | {
      excludedTabs?: Tabs[]
    }
)

const defaultDisplayedTabs: Tabs[] = ['link', 'pexels']

export const VideoUploadContent = ({
  content,
  onSubmit,
  initialTab,
  ...props
}: Props) => {
  const includedTabs =
    'includedTabs' in props
      ? props.includedTabs ?? defaultDisplayedTabs
      : defaultDisplayedTabs
  const excludedTabs = 'excludedTabs' in props ? props.excludedTabs ?? [] : []
  const displayedTabs = defaultDisplayedTabs.filter(
    (tab) => !excludedTabs.includes(tab) && includedTabs.includes(tab)
  )

  const [currentTab, setCurrentTab] = useState<Tabs>(
    initialTab ?? displayedTabs[0]
  )

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
    <Stack>
      <HStack>
        {displayedTabs.includes('link') && (
          <Button
            variant={currentTab === 'link' ? 'solid' : 'ghost'}
            onClick={() => setCurrentTab('link')}
            size="sm"
          >
            Link
          </Button>
        )}
        {displayedTabs.includes('pexels') && (
          <Button
            variant={currentTab === 'pexels' ? 'solid' : 'ghost'}
            onClick={() => setCurrentTab('pexels')}
            size="sm"
          >
            Pexels
          </Button>
        )}
      </HStack>
      {/* Body content to be displayed conditionally based on currentTab */}
      {currentTab === 'link' && (
        <VideoLinkEmbedContent
          content={content}
          updateUrl={updateUrl}
          updateAspectRatio={updateAspectRatio}
          updateMaxWidth={updateMaxWidth}
          updateControlsDisplay={updateControlsDisplay}
          updateAutoPlay={updateAutoPlay}
        />
      )}
      {currentTab === 'pexels' && (
        <Stack pt="2" spacing="4" align="center">
          <Text fontSize="small" margin="auto" my="3">
            Pexels Custom Video Picker
          </Text>
        </Stack>
      )}
    </Stack>
  )
}

const VideoLinkEmbedContent = ({
  content,
  updateUrl,
  updateAspectRatio,
  updateMaxWidth,
  updateControlsDisplay,
  updateAutoPlay,
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) => {
  const { t } = useTranslate()

  return (
    <>
      <Stack py="2">
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
    </>
  )
}
