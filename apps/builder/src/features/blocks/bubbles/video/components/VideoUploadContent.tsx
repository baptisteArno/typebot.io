import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { VideoBubbleBlock } from '@typebot.io/schemas'
import { parseVideoUrl } from '@typebot.io/schemas/features/blocks/bubbles/video/helpers'
import { useState } from 'react'
import { useTranslate } from '@tolgee/react'
import { TElement } from '@udecode/plate-common'
import { UploadButton } from '@/components/ImageUploadContent/UploadButton'
import { RichTextCaptionEditor } from '@/components/RichTextCaptionEditor'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'
import { VideoLinkEmbedContent } from '@/components/VideoUploadContent/VideoLinkEmbedContent'

const acceptedVideoFileTypes = ['video/mp4']
const maxVideoUploadSizeInMB = 16

type Tabs = 'upload' | 'link'

type Props = {
  blockId: string
  uploadFileProps: FilePathUploadProps
  content?: VideoBubbleBlock['content']
  onSubmit: (content: VideoBubbleBlock['content']) => void
}

export const VideoUploadContent = ({
  blockId,
  uploadFileProps,
  content,
  onSubmit,
}: Props) => {
  const { t } = useTranslate()
  const [currentTab, setCurrentTab] = useState<Tabs>('upload')

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

  const updateCaption = (caption: TElement[]) => {
    onSubmit({ ...content, caption })
  }

  return (
    <Stack p="2" spacing={4}>
      <Stack spacing={1}>
        <HStack>
          <Button
            variant={currentTab === 'upload' ? 'solid' : 'ghost'}
            onClick={() => setCurrentTab('upload')}
            size="sm"
          >
            Upload
          </Button>
          <Button
            variant={currentTab === 'link' ? 'solid' : 'ghost'}
            onClick={() => setCurrentTab('link')}
            size="sm"
          >
            Link
          </Button>
        </HStack>

        {currentTab === 'upload' && (
          <Flex justify="center" py="2">
            <UploadButton
              fileType="video"
              filePathProps={uploadFileProps}
              onFileUploaded={updateUrl}
              acceptedFileTypes={acceptedVideoFileTypes}
              maxSizeInMB={maxVideoUploadSizeInMB}
              colorScheme="orange"
            >
              {t('editor.header.uploadTab.uploadButton.label')}
            </UploadButton>
          </Flex>
        )}
        {currentTab === 'link' && (
          <VideoLinkEmbedContent content={content} updateUrl={updateUrl} />
        )}
        <Text fontSize="sm" color="gray.500">
          {t('video.helperText.label')}
        </Text>
      </Stack>
      <Stack spacing={1}>
        <Text fontSize="sm" fontWeight="medium">
          {t('video.caption.label')}
        </Text>
        <RichTextCaptionEditor
          id={`video-caption-${blockId}`}
          initialValue={content?.caption ?? []}
          onChange={updateCaption}
        />
        <Text fontSize="sm" color="gray.500">
          {t('video.caption.helperText')}
        </Text>
      </Stack>
    </Stack>
  )
}
