import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  ModalBodyProps,
} from '@chakra-ui/react'
import React from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const SettingsModal = ({
  isOpen,
  onClose,
  ...props
}: Props & ModalBodyProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader />
        <ModalCloseButton />
        <ModalBody {...props}>{props.children}</ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
