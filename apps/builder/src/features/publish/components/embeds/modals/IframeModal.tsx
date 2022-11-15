import { AlertInfo } from '@/components/AlertInfo'
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
import { useState } from 'react'
import { StandardEmbedWindowSettings } from '../codeSnippets/Container/EmbedSettings'
import { IframeEmbedCode } from '../codeSnippets/Iframe/EmbedCode'
import { ModalProps } from '../EmbedButton'

export const IframeModal = ({ isPublished, isOpen, onClose }: ModalProps) => {
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
          {!isPublished && (
            <AlertInfo>You need to publish your bot first.</AlertInfo>
          )}
          <Text>Paste this anywhere in your HTML code:</Text>
          <StandardEmbedWindowSettings
            onUpdateWindowSettings={(settings) =>
              setInputValues({ ...settings })
            }
          />
          <IframeEmbedCode {...inputValues} />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
