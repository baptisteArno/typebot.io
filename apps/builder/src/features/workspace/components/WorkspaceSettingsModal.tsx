import {
  Modal,
  ModalOverlay,
  ModalContent,
  Stack,
  Text,
  Button,
  Flex,
} from '@chakra-ui/react'
import { SettingsIcon } from '@/components/icons'
import { User } from '@typebot.io/prisma'
import { WorkspaceInApp } from '../WorkspaceProvider'
import packageJson from '../../../../../../package.json'
import { UserPreferencesForm } from '@/features/account/components/UserPreferencesForm'
import { useTranslate } from '@tolgee/react'
import { useParentModal } from '@/features/graph/providers/ParentModalProvider'

type Props = {
  isOpen: boolean
  user: User
  workspace: WorkspaceInApp
  defaultTab?: SettingsTab
  onClose: () => void
}

type SettingsTab =
  | 'my-account'
  | 'user-settings'
  | 'workspace-settings'
  | 'members'
  | 'billing'
  | 'credentials'

export const WorkspaceSettingsModal = ({ isOpen, user, onClose }: Props) => {
  const { t } = useTranslate()
  const { ref } = useParentModal()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent minH="600px" flexDir="row" ref={ref}>
        <Stack
          spacing={8}
          w="180px"
          py="6"
          borderRightWidth={1}
          justifyContent="space-between"
        >
          <Stack spacing={8}>
            <Stack>
              <Text pl="4" color="gray.500">
                {user.email}
              </Text>

              <Button
                leftIcon={<SettingsIcon />}
                size="sm"
                justifyContent="flex-start"
                pl="4"
              >
                {t('workspace.settings.modal.menu.preferences.label')}
              </Button>
            </Stack>
          </Stack>

          <Flex justify="center" pt="10">
            <Text color="gray.500" fontSize="xs">
              {t('workspace.settings.modal.menu.version.label', {
                version: packageJson.version,
              })}
            </Text>
          </Flex>
        </Stack>

        {isOpen && (
          <Flex flex="1" p="10">
            <UserPreferencesForm />
          </Flex>
        )}
      </ModalContent>
    </Modal>
  )
}
