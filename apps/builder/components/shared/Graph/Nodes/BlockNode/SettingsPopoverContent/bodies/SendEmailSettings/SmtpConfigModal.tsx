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
import { useUser } from 'contexts/UserContext'
import { CredentialsType, SmtpCredentialsData } from 'models'
import React, { useState } from 'react'
import { createCredentials } from 'services/user'
import { testSmtpConfig } from 'services/integrations'
import { isNotDefined } from 'utils'
import { SmtpConfigForm } from './SmtpConfigForm'
import { useWorkspace } from 'contexts/WorkspaceContext'
import { useToast } from 'components/shared/hooks/useToast'

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
  const [smtpConfig, setSmtpConfig] = useState<SmtpCredentialsData>({
    from: {},
    port: 25,
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
    const { data, error } = await createCredentials({
      data: smtpConfig,
      name: smtpConfig.from.email as string,
      type: CredentialsType.SMTP,
      workspaceId: workspace.id,
    })
    setIsCreating(false)
    if (error)
      return showToast({ title: error.name, description: error.message })
    if (!data?.credentials)
      return showToast({ description: "Credentials wasn't created" })
    onNewCredentials(data.credentials.id)
    onClose()
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
