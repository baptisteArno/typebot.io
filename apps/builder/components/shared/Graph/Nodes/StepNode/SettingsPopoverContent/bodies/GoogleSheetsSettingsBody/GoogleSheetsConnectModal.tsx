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
import { GoogleLogo } from 'assets/logos'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { Info } from 'components/shared/Info'
import { useWorkspace } from 'contexts/WorkspaceContext'
import React from 'react'
import { getGoogleSheetsConsentScreenUrl } from 'services/integrations'

type Props = {
  isOpen: boolean
  stepId: string
  onClose: () => void
}

export const GoogleSheetConnectModal = ({ stepId, isOpen, onClose }: Props) => {
  const { workspace } = useWorkspace()
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect Spreadsheets</ModalHeader>
        <ModalCloseButton />
        <ModalBody as={Stack} spacing="6">
          <Info>
            Typebot needs access to Google Drive in order to list all your
            spreadsheets. It also needs access to your spreadsheets in order to
            fetch or inject data in it.
          </Info>
          <Text>
            Make sure to check all the permissions so that the integration works
            as expected:
          </Text>
          <Image
            src="/images/google-spreadsheets-scopes.jpeg"
            alt="Google Spreadsheets checkboxes"
          />
          <Flex>
            <Button
              as={NextChakraLink}
              leftIcon={<GoogleLogo />}
              data-testid="google"
              isLoading={['loading', 'authenticated'].includes(status)}
              variant="outline"
              href={getGoogleSheetsConsentScreenUrl(
                window.location.href,
                stepId,
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
