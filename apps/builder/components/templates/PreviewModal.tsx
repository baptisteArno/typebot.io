import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react'
import { TypebotViewer } from 'bot-engine'
import { Typebot } from 'models'
import React from 'react'
import { parseTypebotToPublicTypebot } from 'services/publicTypebot'
import { TemplateProps } from './data'

type Props = {
  template: TemplateProps
  typebot: Typebot
  isOpen: boolean
  onCreateClick: () => void
  onClose: () => void
}

export const PreviewModal = ({
  template,
  typebot,
  isOpen,
  onClose,
  onCreateClick,
}: Props) => {
  const handleCreateClick = () => {
    onCreateClick()
    onClose()
  }
  return (
    <Modal
      size="3xl"
      isOpen={isOpen}
      onClose={onClose}
      blockScrollOnMount={false}
    >
      <ModalOverlay />
      <ModalContent h="85vh">
        <ModalHeader>
          {(template.emoji ?? '') + ' ' + template.name}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TypebotViewer typebot={parseTypebotToPublicTypebot(typebot)} />
        </ModalBody>

        <ModalFooter>
          <Button mr={3} onClick={handleCreateClick}>
            Use this template
          </Button>
          <Button variant="ghost" colorScheme="gray" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
