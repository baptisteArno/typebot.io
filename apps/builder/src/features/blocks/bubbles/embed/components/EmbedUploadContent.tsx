import { TextInput } from '@/components/inputs'
import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { EmbedBubbleBlock } from '@typebot.io/schemas'
import { sanitizeUrl } from '@typebot.io/lib'
import { useTranslate } from '@tolgee/react'
import { useState } from 'react'
import { TElement } from '@udecode/plate-common'
import { UploadButton } from '@/components/ImageUploadContent/UploadButton'
import { RichTextCaptionEditor } from '@/components/RichTextCaptionEditor'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'

const acceptedDocumentFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]
const maxDocumentUploadSizeInMB = 15

type Tabs = 'upload' | 'link'

type Props = {
  blockId: string
  uploadFileProps: FilePathUploadProps
  content: EmbedBubbleBlock['content']
  onSubmit: (content: EmbedBubbleBlock['content']) => void
}

export const EmbedUploadContent = ({
  blockId,
  uploadFileProps,
  content,
  onSubmit,
}: Props) => {
  const { t } = useTranslate()
  const [currentTab, setCurrentTab] = useState<Tabs>('upload')

  const handleUrlChange = (url: string) => {
    const trimmedUrl = url.trim()
    const documentUrl = sanitizeUrl(
      trimmedUrl.startsWith('<iframe')
        ? extractUrlFromIframe(trimmedUrl)
        : trimmedUrl
    )
    onSubmit({
      ...content,
      url: documentUrl,
      fileName: content?.fileName ?? guessFileNameFromUrl(documentUrl),
    })
  }

  const handleFileUploaded = (url: string, fileName: string) => {
    onSubmit({
      ...content,
      url,
      fileName: content?.fileName ?? fileName,
    })
  }

  const updateFileName = (fileName: string) => {
    onSubmit({ ...content, fileName })
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
              fileType="document"
              filePathProps={uploadFileProps}
              onFileUploaded={handleFileUploaded}
              acceptedFileTypes={acceptedDocumentFileTypes}
              maxSizeInMB={maxDocumentUploadSizeInMB}
              colorScheme="orange"
            >
              {t('editor.header.uploadTab.uploadButton.label')}
            </UploadButton>
          </Flex>
        )}
        {currentTab === 'link' && (
          <TextInput
            placeholder={t(
              'editor.blocks.bubbles.embed.settings.worksWith.placeholder'
            )}
            defaultValue={content?.url ?? ''}
            onChange={handleUrlChange}
          />
        )}
      </Stack>
      <Stack spacing={1}>
        <Text fontSize="sm" fontWeight="medium">
          {t('editor.blocks.bubbles.embed.caption.label')}
        </Text>
        <RichTextCaptionEditor
          id={`embed-caption-${blockId}`}
          initialValue={content?.caption ?? []}
          onChange={updateCaption}
        />
        <Text fontSize="sm" color="gray.500">
          {t('editor.blocks.bubbles.embed.caption.helperText')}
        </Text>
      </Stack>
      <Text fontSize="sm" color="gray.500">
        {t('editor.blocks.bubbles.embed.helperText.label')}
      </Text>
      <Stack spacing={1}>
        <Text fontSize="sm" fontWeight="medium">
          {t('editor.blocks.bubbles.embed.fileName.label')}
        </Text>
        <TextInput
          placeholder={t('editor.blocks.bubbles.embed.fileName.placeholder')}
          defaultValue={content?.fileName ?? ''}
          onChange={updateFileName}
        />
        <Text fontSize="sm" color="gray.500">
          {t('editor.blocks.bubbles.embed.fileName.helperText')}
        </Text>
      </Stack>
    </Stack>
  )
}

const extractUrlFromIframe = (iframe: string) =>
  [...iframe.matchAll(/src="([^"]+)"/g)][0][1]

const guessFileNameFromUrl = (url: string): string | undefined => {
  try {
    const { pathname } = new URL(url)
    const segment = decodeURIComponent(pathname.split('/').pop() ?? '')
    return segment.includes('.') ? segment : undefined
  } catch {
    return undefined
  }
}
