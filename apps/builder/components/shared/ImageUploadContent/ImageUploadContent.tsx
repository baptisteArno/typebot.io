import { ChangeEvent, FormEvent, useState } from 'react'
import { Button, HStack, Input, Stack } from '@chakra-ui/react'
import { SearchContextManager } from '@giphy/react-components'
import { UploadButton } from '../buttons/UploadButton'
import { GiphySearch } from './GiphySearch'
import { useTypebot } from 'contexts/TypebotContext'

type Props = {
  url?: string
  onSubmit: (url: string) => void
}

export const ImageUploadContent = ({ url, onSubmit }: Props) => {
  const [currentTab, setCurrentTab] = useState<'link' | 'upload' | 'giphy'>(
    'upload'
  )

  return (
    <Stack>
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
          Embed link
        </Button>
        {process.env.NEXT_PUBLIC_GIPHY_API_KEY && (
          <Button
            variant={currentTab === 'giphy' ? 'solid' : 'ghost'}
            onClick={() => setCurrentTab('giphy')}
            size="sm"
          >
            Giphy
          </Button>
        )}
      </HStack>

      <BodyContent tab={currentTab} onSubmit={onSubmit} url={url} />
    </Stack>
  )
}

const BodyContent = ({
  tab,
  url,
  onSubmit,
}: {
  tab: 'upload' | 'link' | 'giphy'
  url?: string
  onSubmit: (url: string) => void
}) => {
  switch (tab) {
    case 'upload':
      return <UploadFileContent onNewUrl={onSubmit} />
    case 'link':
      return <EmbedLinkContent initialUrl={url} onNewUrl={onSubmit} />
    case 'giphy':
      return <GiphyContent onNewUrl={onSubmit} />
  }
}

type ContentProps = { initialUrl?: string; onNewUrl: (url: string) => void }

const UploadFileContent = ({ onNewUrl }: ContentProps) => {
  const { typebot } = useTypebot()
  return (
    <Stack>
      <UploadButton
        filePath={`typebots/${typebot?.id}`}
        onFileUploaded={onNewUrl}
        includeFileName
        colorScheme="blue"
      >
        Choose an image
      </UploadButton>
    </Stack>
  )
}

const EmbedLinkContent = ({ initialUrl, onNewUrl }: ContentProps) => {
  const [imageUrl, setImageUrl] = useState(initialUrl ?? '')

  const handleImageUrlChange = (e: ChangeEvent<HTMLInputElement>) =>
    setImageUrl(e.target.value)

  const handleUrlSubmit = (e: FormEvent) => {
    e.preventDefault()
    onNewUrl(imageUrl)
  }

  return (
    <Stack as="form" onSubmit={handleUrlSubmit}>
      <Input
        placeholder={'Paste the image link...'}
        onChange={handleImageUrlChange}
        value={imageUrl}
      />
      <Button type="submit" disabled={imageUrl === ''} colorScheme="blue">
        Embed image
      </Button>
    </Stack>
  )
}

const GiphyContent = ({ onNewUrl }: ContentProps) => (
  <SearchContextManager
    apiKey={process.env.NEXT_PUBLIC_GIPHY_API_KEY as string}
  >
    <GiphySearch onSubmit={onNewUrl} />
  </SearchContextManager>
)
