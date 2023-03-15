import { AlertInfo } from '@/components/AlertInfo'
import { CopyButton } from '@/components/CopyButton'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  Heading,
  ModalCloseButton,
  ModalBody,
  OrderedList,
  ListItem,
  Code,
  InputGroup,
  Input,
  InputRightElement,
  ModalFooter,
  Text,
  Stack,
} from '@chakra-ui/react'
import { env, getViewerUrl } from '@typebot.io/lib'
import { ModalProps } from '../EmbedButton'

export const NotionModal = ({
  isPublished,
  publicId,
  isOpen,
  onClose,
}: ModalProps): JSX.Element => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">Notion</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!isPublished && (
            <AlertInfo mb="4">You need to publish your bot first.</AlertInfo>
          )}
          <OrderedList spacing={4}>
            <ListItem>
              Type <Code>/embed</Code>
            </ListItem>
            <ListItem>
              <Stack>
                <Text>Paste your typebot URL</Text>
                <InputGroup size="sm">
                  <Input
                    type={'text'}
                    defaultValue={`${
                      env('VIEWER_INTERNAL_URL') ?? getViewerUrl()
                    }/${publicId}`}
                  />
                  <InputRightElement width="60px">
                    <CopyButton
                      size="sm"
                      textToCopy={`${
                        env('VIEWER_INTERNAL_URL') ?? getViewerUrl()
                      }/${publicId}`}
                    />
                  </InputRightElement>
                </InputGroup>
              </Stack>
            </ListItem>
          </OrderedList>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
