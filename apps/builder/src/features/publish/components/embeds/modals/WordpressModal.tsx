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
  InputGroup,
  Input,
  InputRightElement,
  ModalFooter,
  Link,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@/components/icons'
import { env, getViewerUrl } from 'utils'
import { ModalProps } from '../EmbedButton'
import { AlertInfo } from '@/components/AlertInfo'
import { CopyButton } from '@/components/CopyButton'

export const WordpressModal = ({
  publicId,
  isPublished,
  isOpen,
  onClose,
}: ModalProps): JSX.Element => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="md">WordPress</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!isPublished && (
            <AlertInfo mb="2">You need to publish your bot first.</AlertInfo>
          )}
          <OrderedList spacing={3}>
            <ListItem>
              Install{' '}
              <Link
                href="https://wordpress.org/plugins/typebot/"
                isExternal
                color="blue.500"
              >
                the official Typebot WordPress plugin
                <ExternalLinkIcon mx="2px" />
              </Link>
            </ListItem>
            <ListItem>
              Copy your typebot URL
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
            <ListItem>Complete the setup in your Wordpress interface</ListItem>
          </OrderedList>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
