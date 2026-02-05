import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import React, { useState, useEffect } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (toolDescription: string) => void
  initialToolDescription: string
  isLoading: boolean
}

export const EditToolDescriptionModal = ({
  isOpen,
  onClose,
  onSave,
  initialToolDescription,
  isLoading,
}: Props) => {
  const [toolDescription, setToolDescription] = useState(initialToolDescription)

  useEffect(() => {
    setToolDescription(initialToolDescription)
  }, [initialToolDescription])

  const handleSaveClick = () => {
    onSave(toolDescription)
    onClose()
  }

  const isValid = toolDescription.trim() !== ''

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Tool Description</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Tool description</FormLabel>
              <Alert status="info" mb={2} borderRadius="md">
                <AlertIcon />
                Extremamente importante: essa descrição será usada pelo nosso
                agente para decidir qual tool utilizar durante o reasoning loop.
              </Alert>
              <Textarea
                placeholder="Ex: 'Busca pedidos por CPF via API X e retorna status e detalhes do pedido'"
                value={toolDescription}
                onChange={(e) => setToolDescription(e.target.value)}
                rows={4}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSaveClick}
            isLoading={isLoading}
            isDisabled={!isValid}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
