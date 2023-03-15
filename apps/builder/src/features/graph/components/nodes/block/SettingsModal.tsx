import { useParentModal } from '@/features/graph/providers/ParentModalProvider'
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
  const { ref } = useParentModal()
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent onMouseDown={handleMouseDown} ref={ref}>
        <ModalHeader mb="2">
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody {...props}>{props.children}</ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
