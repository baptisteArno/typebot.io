import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  IconButton,
  Heading,
  HStack,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@/components/icons'
import React, { useState } from 'react'
import { ModalProps } from '../../EmbedButton'
import { ChooseEmbedTypeList } from '../ChooseEmbedTypeList'
import { capitalize } from 'utils'
import { JavascriptInstructions } from './JavascriptInstructions'
import { AlertInfo } from '@/components/AlertInfo'

export const JavascriptModal = ({
  isOpen,
  onClose,
  isPublished,
}: ModalProps) => {
  const [chosenEmbedType, setChosenEmbedType] = useState<
    'standard' | 'popup' | 'bubble' | undefined
  >()
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={!chosenEmbedType ? '2xl' : 'xl'}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            {chosenEmbedType && (
              <IconButton
                icon={<ChevronLeftIcon />}
                aria-label="back"
                variant="ghost"
                colorScheme="gray"
                mr={2}
                onClick={() => setChosenEmbedType(undefined)}
              />
            )}
            <Heading size="md">
              Javascript {chosenEmbedType && `- ${capitalize(chosenEmbedType)}`}
            </Heading>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!isPublished && (
            <AlertInfo mb="2">You need to publish your bot first.</AlertInfo>
          )}
          {!chosenEmbedType ? (
            <ChooseEmbedTypeList onSelectEmbedType={setChosenEmbedType} />
          ) : (
            <JavascriptInstructions type={chosenEmbedType} />
          )}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
