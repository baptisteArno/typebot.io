import {
  Flex,
  Stack,
} from '@chakra-ui/react'
import { UploadButton } from '../buttons/UploadButton'
import { useTypebot } from 'contexts/TypebotContext'

type Props = {
  url?: string
  isEmojiEnabled?: boolean
  isGiphyEnabled?: boolean
  onSubmit: (url: string, type: string, name: string, size: number) => void
  onClose?: () => void
}

export const ImageUploadContent = ({
  onSubmit,
  onClose,
}: Props) => {
  return (
    <Stack>
      <UploadFileContent onNewUrl={onSubmit} />
    </Stack>
  )
}

type ContentProps = { initialUrl?: string; onNewUrl: (url: string, type: string, name: string, size: number) => void }

const UploadFileContent = ({ onNewUrl }: ContentProps) => {
  const { typebot } = useTypebot()
  return (
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
  )
}
