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
  Tag,
  InputGroup,
  Input,
  InputRightElement,
  ModalFooter,
} from '@chakra-ui/react'
import { env, getViewerUrl } from 'utils'
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
          <OrderedList spacing={3}>
            <ListItem>
              Type <Tag>/embed</Tag>
            </ListItem>
            <ListItem>
              Paste your typebot URL
              <InputGroup size="md" mt={2}>
                <Input
                  pr="4.5rem"
                  type={'text'}
                  defaultValue={`${
                    env('VIEWER_INTERNAL_URL') ?? getViewerUrl()
                  }/${publicId}`}
                />
                <InputRightElement width="4.5rem">
                  <CopyButton
                    textToCopy={`${
                      env('VIEWER_INTERNAL_URL') ?? getViewerUrl()
                    }/${publicId}`}
                  />
                </InputRightElement>
              </InputGroup>
            </ListItem>
          </OrderedList>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
