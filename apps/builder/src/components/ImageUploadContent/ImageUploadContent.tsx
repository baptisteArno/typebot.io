import { useState } from 'react'
import { Button, Flex, HStack, Stack } from '@chakra-ui/react'
import { UploadButton } from './UploadButton'
import { GiphyPicker } from './GiphyPicker'
import { TextInput } from '../inputs/TextInput'
import { EmojiSearchableList } from './emoji/EmojiSearchableList'
import { UnsplashPicker } from './UnsplashPicker'

type Tabs = 'link' | 'upload' | 'giphy' | 'emoji' | 'unsplash'

type Props = {
  filePath: string
  includeFileName?: boolean
  defaultUrl?: string
  isEmojiEnabled?: boolean
  isGiphyEnabled?: boolean
  isUnsplashEnabled?: boolean
  imageSize?: 'small' | 'regular' | 'thumb'
  onSubmit: (url: string) => void
  onClose?: () => void
}

export const ImageUploadContent = ({
  filePath,
  includeFileName,
  defaultUrl,
  onSubmit,
  isEmojiEnabled = false,
  isGiphyEnabled = true,
  isUnsplashEnabled = true,
  imageSize = 'regular',
  onClose,
}: Props) => {
  const [currentTab, setCurrentTab] = useState<Tabs>(
    isEmojiEnabled ? 'emoji' : 'link'
  )

  const handleSubmit = (url: string) => {
    onSubmit(url)
    onClose && onClose()
  }

  return (
    <Stack>
      <HStack>
        {isEmojiEnabled && (
          <Button
            variant={currentTab === 'emoji' ? 'solid' : 'ghost'}
            onClick={() => setCurrentTab('emoji')}
            size="sm"
          >
            Emoji
          </Button>
        )}
        <Button
          variant={currentTab === 'link' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('link')}
          size="sm"
        >
          Embed link
        </Button>
        <Button
          variant={currentTab === 'upload' ? 'solid' : 'ghost'}
          onClick={() => setCurrentTab('upload')}
          size="sm"
        >
          Upload
        </Button>
        {isGiphyEnabled && (
          <Button
            variant={currentTab === 'giphy' ? 'solid' : 'ghost'}
            onClick={() => setCurrentTab('giphy')}
            size="sm"
          >
            Giphy
          </Button>
        )}
        {isUnsplashEnabled && (
          <Button
            variant={currentTab === 'unsplash' ? 'solid' : 'ghost'}
            onClick={() => setCurrentTab('unsplash')}
            size="sm"
          >
            Unsplash
          </Button>
        )}
      </HStack>

      <BodyContent
        filePath={filePath}
        includeFileName={includeFileName}
        tab={currentTab}
        imageSize={imageSize}
        onSubmit={handleSubmit}
        defaultUrl={defaultUrl}
      />
    </Stack>
  )
}

const BodyContent = ({
  includeFileName,
  filePath,
  tab,
  defaultUrl,
  imageSize,
  onSubmit,
}: {
  includeFileName?: boolean
  filePath: string
  tab: Tabs
  defaultUrl?: string
  imageSize: 'small' | 'regular' | 'thumb'
  onSubmit: (url: string) => void
}) => {
  switch (tab) {
    case 'upload':
      return (
        <UploadFileContent
          filePath={filePath}
          includeFileName={includeFileName}
          onNewUrl={onSubmit}
        />
      )
    case 'link':
      return <EmbedLinkContent defaultUrl={defaultUrl} onNewUrl={onSubmit} />
    case 'giphy':
      return <GiphyContent onNewUrl={onSubmit} />
    case 'emoji':
      return <EmojiSearchableList onEmojiSelected={onSubmit} />
    case 'unsplash':
      return <UnsplashPicker imageSize={imageSize} onImageSelect={onSubmit} />
  }
}

type ContentProps = { onNewUrl: (url: string) => void }

const UploadFileContent = ({
  filePath,
  includeFileName,
  onNewUrl,
}: ContentProps & { filePath: string; includeFileName?: boolean }) => (
  <Flex justify="center" py="2">
    <UploadButton
      fileType="image"
      filePath={filePath}
      onFileUploaded={onNewUrl}
      includeFileName={includeFileName}
      colorScheme="blue"
    >
      Choose an image
    </UploadButton>
  </Flex>
)

const EmbedLinkContent = ({
  defaultUrl,
  onNewUrl,
}: ContentProps & { defaultUrl?: string }) => (
  <Stack py="2">
    <TextInput
      placeholder={'Paste the image link...'}
      onChange={onNewUrl}
      defaultValue={defaultUrl ?? ''}
    />
  </Stack>
)

const GiphyContent = ({ onNewUrl }: ContentProps) => (
  <GiphyPicker onSubmit={onNewUrl} />
)
