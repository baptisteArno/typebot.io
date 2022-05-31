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
import { isEmpty } from 'utils'
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
                    isEmpty(process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL)
                      ? process.env.NEXT_PUBLIC_VIEWER_URL
                      : process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL
                  }/${publicId}`}
                />
                <InputRightElement width="4.5rem">
                  <CopyButton
                    textToCopy={`${
                      isEmpty(process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL)
                        ? process.env.NEXT_PUBLIC_VIEWER_URL
                        : process.env.NEXT_PUBLIC_VIEWER_INTERNAL_URL
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
