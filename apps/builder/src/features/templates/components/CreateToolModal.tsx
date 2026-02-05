import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
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
import { Typebot } from '@typebot.io/schemas'
import React, { useEffect, useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (typebot: Typebot) => void
  isLoading: boolean
  initialTenant?: string
}

export const CreateToolModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialTenant,
}: Props) => {
  const [name, setName] = useState('')
  const [tenant, setTenant] = useState('')
  const [toolDescription, setToolDescription] = useState('')

  useEffect(() => {
    if (initialTenant) {
      setTenant(initialTenant)
    }
  }, [initialTenant])

  const handleCreateClick = () => {
    onSubmit({
      name,
      settings: { general: { type: 'TOOL' } },
      tenant,
      toolDescription,
    } as Typebot)
  }

  const isValid =
    name.trim() !== '' && tenant.trim() !== '' && toolDescription.trim() !== ''

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create new Tool</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="My awesome tool"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Tenant</FormLabel>
              <Input
                placeholder="e.g. workspace-123"
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                isDisabled={!!initialTenant}
              />
              <FormHelperText>
                Identificador do tenant dentro do workspace.
              </FormHelperText>
            </FormControl>
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
            onClick={handleCreateClick}
            isLoading={isLoading}
            isDisabled={!isValid}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
