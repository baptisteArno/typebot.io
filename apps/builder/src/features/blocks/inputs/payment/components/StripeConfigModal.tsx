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
import { useTranslate } from '@tolgee/react'

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
  const { t } = useTranslate()
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
        <ModalHeader>
          {t('blocks.inputs.payment.settings.stripeConfig.title.label')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack as="form" spacing={4}>
            <TextInput
              isRequired
              label={t(
                'blocks.inputs.payment.settings.stripeConfig.accountName.label'
              )}
              onChange={handleNameChange}
              placeholder="Typebot"
              withVariableButton={false}
              debounceTimeout={0}
            />
            <Stack>
              <FormLabel>
                {t(
                  'blocks.inputs.payment.settings.stripeConfig.testKeys.label'
                )}{' '}
                <MoreInfoTooltip>
                  {t(
                    'blocks.inputs.payment.settings.stripeConfig.testKeys.infoText.label'
                  )}
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
                  type="password"
                />
              </HStack>
            </Stack>
            <Stack>
              <FormLabel>
                {t(
                  'blocks.inputs.payment.settings.stripeConfig.liveKeys.label'
                )}
              </FormLabel>
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
                    type="password"
                  />
                </FormControl>
              </HStack>
            </Stack>

            <Text>
              ({t('blocks.inputs.payment.settings.stripeConfig.findKeys.label')}{' '}
              <TextLink href="https://dashboard.stripe.com/apikeys" isExternal>
                {t(
                  'blocks.inputs.payment.settings.stripeConfig.findKeys.here.label'
                )}
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
            {t('connect')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
