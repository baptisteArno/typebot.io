import { AlertInfo } from '@/components/AlertInfo'
import { useWorkspace } from '@/features/workspace'
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
import { ChangePlanForm } from './ChangePlanForm'

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
  const { workspace, refreshWorkspace } = useWorkspace()
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalBody as={Stack} spacing="6" pt="10">
          {type && (
            <AlertInfo>
              You need to upgrade your plan in order to {type}
            </AlertInfo>
          )}
          {workspace && (
            <ChangePlanForm
              workspace={workspace}
              onUpgradeSuccess={refreshWorkspace}
            />
          )}
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
