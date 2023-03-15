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
import { useUser } from '@/features/account/hooks/useUser'
import React, { useState } from 'react'
import { isNotDefined } from '@typebot.io/lib'
import { SmtpConfigForm } from './SmtpConfigForm'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { testSmtpConfig } from '../queries/testSmtpConfigQuery'
import { SmtpCredentials } from '@typebot.io/schemas'
import { trpc } from '@/lib/trpc'

type Props = {
  isOpen: boolean
  onClose: () => void
  onNewCredentials: (id: string) => void
}

export const SmtpConfigModal = ({
  isOpen,
  onNewCredentials,
  onClose,
}: Props) => {
  const { user } = useUser()
  const { workspace } = useWorkspace()
  const [isCreating, setIsCreating] = useState(false)
  const { showToast } = useToast()
  const [smtpConfig, setSmtpConfig] = useState<SmtpCredentials['data']>({
    from: {},
    port: 25,
  })
  const {
    credentials: {
      listCredentials: { refetch: refetchCredentials },
    },
  } = trpc.useContext()
  const { mutate } = trpc.credentials.createCredentials.useMutation({
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

  const handleCreateClick = async () => {
    if (!user?.email || !workspace?.id) return
    setIsCreating(true)
    const { error: testSmtpError } = await testSmtpConfig(
      smtpConfig,
      user.email
    )
    if (testSmtpError) {
      console.error(testSmtpError)
      setIsCreating(false)
      return showToast({
        title: 'Invalid configuration',
        description: "We couldn't send the test email with your configuration",
      })
    }
    mutate({
      credentials: {
        data: smtpConfig,
        name: smtpConfig.from.email as string,
        type: 'smtp',
        workspaceId: workspace.id,
      },
    })
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create SMTP config</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SmtpConfigForm config={smtpConfig} onConfigChange={setSmtpConfig} />
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={handleCreateClick}
            isDisabled={
              isNotDefined(smtpConfig.from.email) ||
              isNotDefined(smtpConfig.host) ||
              isNotDefined(smtpConfig.username) ||
              isNotDefined(smtpConfig.password) ||
              isNotDefined(smtpConfig.port)
            }
            isLoading={isCreating}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
