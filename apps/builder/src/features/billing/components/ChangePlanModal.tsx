import { AlertInfo } from '@/components/AlertInfo'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useTranslate } from '@tolgee/react'
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

export type ChangePlanModalProps = {
  type?: string
  isOpen: boolean
  excludedPlans?: ('STARTER' | 'PRO')[]
  onClose: () => void
}

export const ChangePlanModal = ({
  onClose,
  isOpen,
  type,
  excludedPlans,
}: ChangePlanModalProps) => {
  const { t } = useTranslate()
  const { workspace, currentRole } = useWorkspace()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={excludedPlans ? 'lg' : '2xl'}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalBody as={Stack} spacing="6" pt="10">
          {type && (
            <AlertInfo>
              {t('billing.upgradeLimitLabel', { type: type })}
            </AlertInfo>
          )}
          {workspace && (
            <ChangePlanForm
              workspace={workspace}
              excludedPlans={excludedPlans}
              currentRole={currentRole}
            />
          )}
        </ModalBody>

        <ModalFooter>
          <HStack>
            <Button colorScheme="gray" onClick={onClose}>
              {t('cancel')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
