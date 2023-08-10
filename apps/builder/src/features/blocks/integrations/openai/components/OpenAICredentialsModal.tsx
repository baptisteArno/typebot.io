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
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import React, { useState } from 'react'

const openAITokensPage = 'https://platform.openai.com/account/api-keys'

type Props = {
  isOpen: boolean
  onClose: () => void
  onNewCredentials: (id: string) => void
}

export const OpenAICredentialsModal = ({
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

  const createOpenAICredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace) return
    mutate({
      credentials: {
        type: 'openai',
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
        <ModalHeader>Add OpenAI account</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={createOpenAICredentials}>
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
                  <TextLink href={openAITokensPage} isExternal>
                    here
                  </TextLink>
                  .
                </>
              }
              onChange={setApiKey}
              placeholder="sk-..."
              withVariableButton={false}
              debounceTimeout={0}
            />
            <Alert status="warning">
              <AlertIcon />
              Make sure to add a payment method to your OpenAI account.
              Otherwise, it will not work after a few messages.
            </Alert>
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
