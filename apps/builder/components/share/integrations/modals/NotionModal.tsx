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
import { CopyButton } from 'components/shared/buttons/CopyButton'
import { PublishFirstInfo } from 'components/shared/Info'
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
          {!isPublished && <PublishFirstInfo mb="4" />}
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
                    env('VIEWER_INTERNAL_URL') ??
                    getViewerUrl({ isBuilder: true })
                  }/${publicId}`}
                />
                <InputRightElement width="4.5rem">
                  <CopyButton
                    textToCopy={`${
                      env('VIEWER_INTERNAL_URL') ??
                      getViewerUrl({ isBuilder: true })
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
