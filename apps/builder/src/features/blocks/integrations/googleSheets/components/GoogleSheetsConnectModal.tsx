import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Stack,
  Text,
  Image,
  Button,
  ModalFooter,
  Flex,
} from '@chakra-ui/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import Link from 'next/link'
import React from 'react'
import { AlertInfo } from '@/components/AlertInfo'
import { GoogleLogo } from '@/components/GoogleLogo'
import { getGoogleSheetsConsentScreenUrlQuery } from '../queries/getGoogleSheetsConsentScreenUrlQuery'

type Props = {
  isOpen: boolean
  typebotId?: string
  blockId?: string
  onClose: () => void
}

export const GoogleSheetConnectModal = ({
  typebotId,
  blockId,
  isOpen,
  onClose,
}: Props) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <GoogleSheetConnectModalContent typebotId={typebotId} blockId={blockId} />
    </Modal>
  )
}

export const GoogleSheetConnectModalContent = ({
  typebotId,
  blockId,
}: {
  typebotId?: string
  blockId?: string
}) => {
  const { workspace } = useWorkspace()

  return (
    <ModalContent>
      <ModalHeader>Connect Spreadsheets</ModalHeader>
      <ModalCloseButton />
      <ModalBody as={Stack} spacing="6">
        <Text>
          Make sure to check all the permissions so that the integration works
          as expected:
        </Text>
        <Image
          src="/images/google-spreadsheets-scopes.png"
          alt="Google Spreadsheets checkboxes"
          rounded="md"
        />
        <AlertInfo>
          Google does not provide more granular permissions than
          &quot;read&quot; or &quot;write&quot; access. That&apos;s why it
          states that Typebot can also delete your spreadsheets which it
          won&apos;t.
        </AlertInfo>
        <Flex>
          {workspace?.id && (
            <Button
              as={Link}
              leftIcon={<GoogleLogo />}
              data-testid="google"
              isLoading={['loading', 'authenticated'].includes(status)}
              variant="outline"
              href={getGoogleSheetsConsentScreenUrlQuery(
                window.location.href,
                workspace.id,
                blockId,
                typebotId
              )}
              mx="auto"
            >
              Continue with Google
            </Button>
          )}
        </Flex>
      </ModalBody>
      <ModalFooter />
    </ModalContent>
  )
}
