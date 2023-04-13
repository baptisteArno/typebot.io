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
  blockId: string
  onClose: () => void
}

export const GoogleSheetConnectModal = ({
  blockId,
  isOpen,
  onClose,
}: Props) => {
  const { workspace } = useWorkspace()
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect Spreadsheets</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="6">
          <AlertInfo>
            Typebot needs access to Google Drive in order to list all your
            spreadsheets. It also needs access to your spreadsheets in order to
            fetch or inject data in it.
          </AlertInfo>
          <Text>
            Make sure to check all the permissions so that the integration works
            as expected:
          </Text>
          <Image
            src="/images/google-spreadsheets-scopes.jpeg"
            alt="Google Spreadsheets checkboxes"
            rounded="md"
          />
          <Flex>
            <Button
              as={Link}
              leftIcon={<GoogleLogo />}
              data-testid="google"
              isLoading={['loading', 'authenticated'].includes(status)}
              variant="outline"
              href={getGoogleSheetsConsentScreenUrlQuery(
                window.location.href,
                blockId,
                workspace?.id
              )}
              mx="auto"
            >
              Continue with Google
            </Button>
          </Flex>
        </ModalBody>

        <ModalFooter />
      </ModalContent>
    </Modal>
  )
}
