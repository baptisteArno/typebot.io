import { useUser } from '@/features/account'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from '@chakra-ui/react'
import { GraphNavigation } from 'db'
import React from 'react'
import { EditorSettingsForm } from './EditorSettingsForm'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const EditorSettingsModal = ({ isOpen, onClose }: Props) => {
  const { user } = useUser()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody pt="12" pb="8" px="8">
          <EditorSettingsForm
            defaultGraphNavigation={
              user?.graphNavigation ?? GraphNavigation.TRACKPAD
            }
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
