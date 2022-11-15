import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Stack,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useUser } from '@/features/account'
import { CredentialsType, StripeCredentialsData } from 'models'
import React, { useState } from 'react'
import { useWorkspace } from '@/features/workspace'
import { omit } from 'utils'
import { useToast } from '@/hooks/useToast'
import { Input } from '@/components/inputs'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { TextLink } from '@/components/TextLink'
import { createCredentialsQuery } from '@/features/credentials'

type Props = {
  isOpen: boolean
  onClose: () => void
  onNewCredentials: (id: string) => void
}

export const StripeConfigModal = ({
  isOpen,
  onNewCredentials,
  onClose,
}: Props) => {
  const { user } = useUser()
  const { workspace } = useWorkspace()
  const [isCreating, setIsCreating] = useState(false)
  const { showToast } = useToast()
  const [stripeConfig, setStripeConfig] = useState<
    StripeCredentialsData & { name: string }
  >({
    name: '',
    live: { publicKey: '', secretKey: '' },
    test: { publicKey: '', secretKey: '' },
  })

  const handleNameChange = (name: string) =>
    setStripeConfig({
      ...stripeConfig,
      name,
    })

  const handlePublicKeyChange = (publicKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      live: { ...stripeConfig.live, publicKey },
    })

  const handleSecretKeyChange = (secretKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      live: { ...stripeConfig.live, secretKey },
    })

  const handleTestPublicKeyChange = (publicKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      test: { ...stripeConfig.test, publicKey },
    })

  const handleTestSecretKeyChange = (secretKey: string) =>
    setStripeConfig({
      ...stripeConfig,
      test: { ...stripeConfig.test, secretKey },
    })

  const handleCreateClick = async () => {
    if (!user?.email || !workspace?.id) return
    setIsCreating(true)
    const { data, error } = await createCredentialsQuery({
      data: omit(stripeConfig, 'name'),
      name: stripeConfig.name,
      type: CredentialsType.STRIPE,
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
        <ModalHeader>Connect Stripe account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack as="form" spacing={4}>
            <FormControl isRequired>
              <FormLabel>Account name:</FormLabel>
              <Input
                onChange={handleNameChange}
                placeholder="Typebot"
                withVariableButton={false}
              />
            </FormControl>
            <Stack>
              <FormLabel>
                Test keys:{' '}
                <MoreInfoTooltip>
                  Will be used when previewing the bot.
                </MoreInfoTooltip>
              </FormLabel>
              <HStack>
                <FormControl>
                  <Input
                    onChange={handleTestPublicKeyChange}
                    placeholder="pk_test_..."
                    withVariableButton={false}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    onChange={handleTestSecretKeyChange}
                    placeholder="sk_test_..."
                    withVariableButton={false}
                  />
                </FormControl>
              </HStack>
            </Stack>
            <Stack>
              <FormLabel>Live keys:</FormLabel>
              <HStack>
                <FormControl>
                  <Input
                    onChange={handlePublicKeyChange}
                    placeholder="pk_live_..."
                    withVariableButton={false}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    onChange={handleSecretKeyChange}
                    placeholder="sk_live_..."
                    withVariableButton={false}
                  />
                </FormControl>
              </HStack>
            </Stack>

            <Text>
              (You can find your keys{' '}
              <TextLink href="https://dashboard.stripe.com/apikeys" isExternal>
                here
              </TextLink>
              )
            </Text>
          </Stack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            onClick={handleCreateClick}
            isDisabled={
              stripeConfig.live.publicKey === '' ||
              stripeConfig.name === '' ||
              stripeConfig.live.secretKey === ''
            }
            isLoading={isCreating}
          >
            Connect
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
