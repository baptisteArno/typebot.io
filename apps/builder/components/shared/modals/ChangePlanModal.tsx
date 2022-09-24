import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Stack,
  Button,
  HStack,
} from '@chakra-ui/react'
import { Info } from 'components/shared/Info'
import { ChangePlanForm } from 'components/shared/ChangePlanForm'

export enum LimitReached {
  BRAND = 'remove branding',
  CUSTOM_DOMAIN = 'add custom domains',
  FOLDER = 'create folders',
  FILE_INPUT = 'use file input blocks',
  ANALYTICS = 'unlock in-depth analytics',
}

type ChangePlanModalProps = {
  type?: LimitReached
  isOpen: boolean
  onClose: () => void
}

export const ChangePlanModal = ({
  onClose,
  isOpen,
  type,
}: ChangePlanModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalBody as={Stack} spacing="6" pt="10">
          {type && (
            <Info>You need to upgrade your plan in order to {type}</Info>
          )}
          <ChangePlanForm />
        </ModalBody>

        <ModalFooter>
          <HStack>
            <Button colorScheme="gray" onClick={onClose}>
              Cancel
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
