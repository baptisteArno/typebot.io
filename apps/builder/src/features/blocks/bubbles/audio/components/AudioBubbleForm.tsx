import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { AudioBubbleContent } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'
import { useState } from 'react'
import { UploadButton } from '@/components/ImageUploadContent/UploadButton'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { useTranslate } from '@tolgee/react'
import { FilePathUploadProps } from '@/features/upload/api/generateUploadUrl'

type Props = {
  uploadFileProps: FilePathUploadProps
  content: AudioBubbleContent
  onContentChange: (content: AudioBubbleContent) => void
}

export const AudioBubbleForm = ({
  uploadFileProps,
  content,
  onContentChange,
}: Props) => {
  const { t } = useTranslate()
  const [currentTab, setCurrentTab] = useState<'link' | 'upload'>('link')

  const updateUrl = (url: string) => onContentChange({ ...content, url })

  const updateAutoPlay = (isAutoplayEnabled: boolean) =>
    onContentChange({ ...content, isAutoplayEnabled })

  return (
    <Stack>
      <HStack>
        <Button
          variant={currentTab === 'upload' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('upload')}
          size="sm"
        >
          {t('editor.blocks.bubbles.audio.settings.upload.label')}
        </Button>
        <Button
          variant={currentTab === 'link' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('link')}
          size="sm"
        >
          {t('editor.blocks.bubbles.audio.settings.embedLink.label')}
        </Button>
      </HStack>
      <Stack p="2" spacing={4}>
        <Stack>
          {currentTab === 'upload' && (
            <Flex justify="center" py="2">
              <UploadButton
                fileType="audio"
                filePathProps={uploadFileProps}
                onFileUploaded={updateUrl}
                colorScheme="blue"
              >
                {t('editor.blocks.bubbles.audio.settings.chooseFile.label')}
              </UploadButton>
            </Flex>
          )}
          {currentTab === 'link' && (
            <>
              <TextInput
                placeholder={t(
                  'editor.blocks.bubbles.audio.settings.worksWith.placeholder'
                )}
                defaultValue={content.url ?? ''}
                onChange={updateUrl}
              />
              <Text fontSize="sm" color="gray.400" textAlign="center">
                {t('editor.blocks.bubbles.audio.settings.worksWith.text')}
              </Text>
            </>
          )}
        </Stack>
        <SwitchWithLabel
          label={t('editor.blocks.bubbles.audio.settings.autoplay.label')}
          initialValue={content.isAutoplayEnabled ?? true}
          onCheckChange={updateAutoPlay}
        />
      </Stack>
    </Stack>
  )
}
