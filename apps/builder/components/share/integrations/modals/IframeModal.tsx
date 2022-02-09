import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  ModalFooter,
  Text,
} from '@chakra-ui/react'
import { PublishFirstInfo } from 'components/shared/Info'
import { useState } from 'react'
import { ModalProps } from '../EmbedButton'

export const IframeModal = ({
  isPublished,
  publicId,
  isOpen,
  onClose,
}: ModalProps) => {
  const [inputValues, setInputValues] = useState({
    heightLabel: '100%',
    widthLabel: '100%',
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={'xl'}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Iframe</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing={4}>
          {!isPublished && <PublishFirstInfo />}
          <Text>Paste this anywhere in your HTML code:</Text>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
