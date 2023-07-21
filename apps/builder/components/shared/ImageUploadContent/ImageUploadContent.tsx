import {
  Flex,
  FormLabel,
  Stack,
} from '@chakra-ui/react'
import { UploadButton } from '../buttons/UploadButton'
import { useTypebot } from 'contexts/TypebotContext'
import { RenderContent } from '../Graph/Nodes/StepNode/StepNodeContent/contents/MediaInput/MediaInputContent'
import { FooterMessage } from '../buttons/UploadButton.style'

type Props = {
  url?: string
  name?: string
  size?: number
  isEmojiEnabled?: boolean
  isGiphyEnabled?: boolean
  onSubmit: (url: string, type: string, name: string, size: number) => void
  onClose?: () => void
}

export const ImageUploadContent = ({
  onSubmit,
  onClose,
  url,
  name,
  size
}: Props) => {
  return (
    <Stack>
      <UploadFileContent onNewUrl={onSubmit} initialUrl={url} name={name} size={size} />
    </Stack>
  )
}

type ContentProps = { initialUrl?: string, name?: string, size?: number, onNewUrl: (url: string, type: string, name: string, size: number) => void }

const UploadFileContent = ({ onNewUrl, initialUrl, name, size }: ContentProps) => {
  const { typebot } = useTypebot()
  return (
    <Stack spacing={4}>
      {initialUrl &&
        <Stack>
          <RenderContent url={initialUrl} containsVariables={false} fullImage={true} name={name} size={size} />
        </Stack>
      }
      <Stack>
        <Flex justify="center" py="2">
          <UploadButton
            filePath={`public/typebots/${typebot?.id}`}
            onFileUploaded={onNewUrl}
            includeFileName
            colorScheme="blue"
          >
            Selecione um arquivo
          </UploadButton>

        </Flex>
      </Stack>



    </Stack>

  )
}
