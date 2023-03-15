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
import React, { useState } from 'react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { TextInput } from '@/components/inputs'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'
import { TextLink } from '@/components/TextLink'
import { StripeCredentials } from '@typebot.io/schemas'
import { trpc } from '@/lib/trpc'
import { isNotEmpty } from '@typebot.io/lib'
import { useUser } from '@/features/account/hooks/useUser'

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
    StripeCredentials['data'] & { name: string }
  >({
    name: '',
    live: { publicKey: '', secretKey: '' },
    test: { publicKey: '', secretKey: '' },
  })
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

  const createCredentials = async () => {
    if (!user?.email || !workspace?.id) return
    mutate({
      credentials: {
        data: {
          live: stripeConfig.live,
          test: {
            publicKey: isNotEmpty(stripeConfig.test.publicKey)
              ? stripeConfig.test.publicKey
              : undefined,
            secretKey: isNotEmpty(stripeConfig.test.secretKey)
              ? stripeConfig.test.secretKey
              : undefined,
          },
        },
        name: stripeConfig.name,
        type: 'stripe',
        workspaceId: workspace.id,
      },
    })
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect Stripe account</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack as="form" spacing={4}>
            <TextInput
              isRequired
              label="Account name:"
              onChange={handleNameChange}
              placeholder="Typebot"
              withVariableButton={false}
              debounceTimeout={0}
            />
            <Stack>
              <FormLabel>
                Test keys:{' '}
                <MoreInfoTooltip>
                  Will be used when previewing the bot.
                </MoreInfoTooltip>
              </FormLabel>
              <HStack>
                <TextInput
                  onChange={handleTestPublicKeyChange}
                  placeholder="pk_test_..."
                  withVariableButton={false}
                  debounceTimeout={0}
                />
                <TextInput
                  onChange={handleTestSecretKeyChange}
                  placeholder="sk_test_..."
                  withVariableButton={false}
                  debounceTimeout={0}
                />
              </HStack>
            </Stack>
            <Stack>
              <FormLabel>Live keys:</FormLabel>
              <HStack>
                <FormControl>
                  <TextInput
                    onChange={handlePublicKeyChange}
                    placeholder="pk_live_..."
                    withVariableButton={false}
                    debounceTimeout={0}
                  />
                </FormControl>
                <FormControl>
                  <TextInput
                    onChange={handleSecretKeyChange}
                    placeholder="sk_live_..."
                    withVariableButton={false}
                    debounceTimeout={0}
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
            onClick={createCredentials}
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
