import { TextInput } from '@/components/inputs/TextInput'
import { TextLink } from '@/components/TextLink'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  ModalFooter,
  Button,
} from '@chakra-ui/react'
import React, { useState } from 'react'

const zemanticAIDashboardPage = 'https://zemantic.ai/dashboard/settings'

type Props = {
  isOpen: boolean
  onClose: () => void
  onNewCredentials: (id: string) => void
}

export const ZemanticAiCredentialsModal = ({
  isOpen,
  onClose,
  onNewCredentials,
}: Props) => {
  const { workspace } = useWorkspace()
  const { showToast } = useToast()
  const [apiKey, setApiKey] = useState('')
  const [name, setName] = useState('')

  const [isCreating, setIsCreating] = useState(false)

  const {
    credentials: {
      listCredentials: { refetch: refetchCredentials },
    },
  } = trpc.useContext()
  const { mutate } = trpc.credentials.createCredentials.useMutation({
    onMutate: () => setIsCreating(true),
    onSettled: () => setIsCreating(false),
    onError: (err) => {
      showToast({
        description: err.message,
        status: 'error',
      })
    },
    onSuccess: (data) => {
      refetchCredentials()
      onNewCredentials(data.credentialsId)
      onClose()
    },
  })

  const createZemanticAiCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace) return
    mutate({
      credentials: {
        type: 'zemanticAi',
        workspaceId: workspace.id,
        name,
        data: {
          apiKey,
        },
      },
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Zemantic AI account</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={createZemanticAiCredentials}>
          <ModalBody as={Stack} spacing="6">
            <TextInput
              isRequired
              label="Name"
              onChange={setName}
              placeholder="My account"
              withVariableButton={false}
              debounceTimeout={0}
            />
            <TextInput
              isRequired
              type="password"
              label="API key"
              helperText={
                <>
                  You can generate an API key{' '}
                  <TextLink href={zemanticAIDashboardPage} isExternal>
                    here
                  </TextLink>
                  .
                </>
              }
              onChange={setApiKey}
              placeholder="ze..."
              withVariableButton={false}
              debounceTimeout={0}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              isLoading={isCreating}
              isDisabled={apiKey === '' || name === ''}
              colorScheme="blue"
            >
              Create
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
