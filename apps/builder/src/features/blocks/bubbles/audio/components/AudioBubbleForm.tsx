import { Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { AudioBubbleContent } from '@typebot.io/schemas'
import { TextInput } from '@/components/inputs'
import { useState } from 'react'
import { UploadButton } from '@/components/ImageUploadContent/UploadButton'
import { SwitchWithLabel } from '@/components/inputs/SwitchWithLabel'
import { I18nFunction } from '@/locales'

type Props = {
  scopedT: I18nFunction
  fileUploadPath: string
  content: AudioBubbleContent
  onContentChange: (content: AudioBubbleContent) => void
}

export const AudioBubbleForm = ({
  scopedT,
  fileUploadPath,
  content,
  onContentChange,
}: Props) => {
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
          {scopedT('bubbles.audio.button.upload.label')}
        </Button>
        <Button
          variant={currentTab === 'link' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('link')}
          size="sm"
        >
          {scopedT('bubbles.audio.button.embedLink.label')}
        </Button>
      </HStack>
      <Stack p="2" spacing={4}>
        <Stack>
          {currentTab === 'upload' && (
            <Flex justify="center" py="2">
              <UploadButton
                fileType="audio"
                filePath={fileUploadPath}
                onFileUploaded={updateUrl}
                colorScheme="blue"
              >
                {scopedT('bubbles.audio.button.chooseFile.label')}
              </UploadButton>
            </Flex>
          )}
          {currentTab === 'link' && (
            <>
              <TextInput
                placeholder={scopedT('bubbles.audio.textInput.worksWith.placeholder')}
                defaultValue={content.url ?? ''}
                onChange={updateUrl}
              />
              <Text fontSize="sm" color="gray.400" textAlign="center">
                {scopedT('bubbles.audio.textInput.worksWith.text')}
              </Text>
            </>
          )}
        </Stack>
        <SwitchWithLabel
          label={scopedT('bubbles.audio.switchWithLabel.autoplay.label')}
          initialValue={content.isAutoplayEnabled ?? true}
          onCheckChange={updateAutoPlay}
        />
      </Stack>
    </Stack>
  )
}
