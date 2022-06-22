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
import { ExternalLinkIcon } from 'assets/icons'
import { CopyButton } from 'components/shared/buttons/CopyButton'
import { PublishFirstInfo } from 'components/shared/Info'
import { isEmpty } from 'utils'
import { ModalProps } from '../EmbedButton'

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
          {!isPublished && <PublishFirstInfo mb="2" />}
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
            <ListItem>Complete the setup in your Wordpress interface</ListItem>
          </OrderedList>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
