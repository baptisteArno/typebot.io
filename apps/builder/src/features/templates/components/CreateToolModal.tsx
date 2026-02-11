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
  Select,
  Textarea,
  VStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { Typebot } from '@typebot.io/schemas'
import React, { useEffect, useState } from 'react'

type WorkspaceOption = {
  id: string
  name: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (typebot: Typebot, workspaceId: string) => void
  isLoading: boolean
  initialTenant?: string
  workspaces: WorkspaceOption[]
  currentWorkspaceId?: string
}

export const CreateToolModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialTenant,
  workspaces,
  currentWorkspaceId,
}: Props) => {
  const [name, setName] = useState('')
  const [tenant, setTenant] = useState('')
  const [toolDescription, setToolDescription] = useState('')
  const [workspaceId, setWorkspaceId] = useState(currentWorkspaceId ?? '')

  const hasAutoSelectedRef = React.useRef(false)

  useEffect(() => {
    if (initialTenant) {
      setTenant(initialTenant)
    }
  }, [initialTenant])

  useEffect(() => {
    if (currentWorkspaceId && !workspaceId) {
      setWorkspaceId(currentWorkspaceId)
    }
  }, [currentWorkspaceId, workspaceId])

  useEffect(() => {
    if (
      !isOpen ||
      !initialTenant ||
      workspaces.length === 0 ||
      hasAutoSelectedRef.current
    )
      return

    const bestMatch = workspaces.reduce(
      (best, current) => {
        const distance = levenshteinDistance(
          initialTenant.toLowerCase(),
          current.name.toLowerCase()
        )
        return distance < best.distance ? { ws: current, distance } : best
      },
      { ws: workspaces[0], distance: Infinity }
    )

    if (bestMatch.ws && bestMatch.ws.id !== workspaceId) {
      setWorkspaceId(bestMatch.ws.id)
    }
    hasAutoSelectedRef.current = true
  }, [isOpen, initialTenant, workspaces, workspaceId])

  useEffect(() => {
    if (!isOpen) {
      hasAutoSelectedRef.current = false
    }
  }, [isOpen])

  const handleCreateClick = () => {
    onSubmit(
      {
        name,
        settings: { general: { type: 'TOOL' } },
        tenant,
        toolDescription,
      } as Typebot,
      workspaceId
    )
  }

  const isValid =
    name.trim() !== '' &&
    tenant.trim() !== '' &&
    toolDescription.trim() !== '' &&
    workspaceId !== ''

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create new Tool</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Workspace</FormLabel>
              <Select
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
              >
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </Select>
            </FormControl>
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

const levenshteinDistance = (a: string, b: string) => {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        )
      }
    }
  }

  return matrix[b.length][a.length]
}
