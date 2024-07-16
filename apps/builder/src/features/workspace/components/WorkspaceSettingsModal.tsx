import {
  Modal,
  ModalOverlay,
  ModalContent,
  Stack,
  Text,
  Button,
  Avatar,
  Flex,
} from '@chakra-ui/react'
import {
  CreditCardIcon,
  HardDriveIcon,
  SettingsIcon,
  UsersIcon,
  WalletIcon,
} from '@/components/icons'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { User, WorkspaceRole } from '@typebot.io/prisma'
import { useState } from 'react'
import { MembersList } from './MembersList'
import { WorkspaceSettingsForm } from './WorkspaceSettingsForm'
import { WorkspaceInApp, useWorkspace } from '../WorkspaceProvider'
import packageJson from '../../../../../../package.json'
import { UserPreferencesForm } from '@/features/account/components/UserPreferencesForm'
import { MyAccountForm } from '@/features/account/components/MyAccountForm'
import { BillingSettingsLayout } from '@/features/billing/components/BillingSettingsLayout'
import { useTranslate } from '@tolgee/react'
import { useParentModal } from '@/features/graph/providers/ParentModalProvider'
import { CredentialsSettingsForm } from '@/features/credentials/components/CredentialsSettingsForm'

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

export const WorkspaceSettingsModal = ({
  isOpen,
  user,
  workspace,
  defaultTab = 'my-account',
  onClose,
}: Props) => {
  const { t } = useTranslate()
  const { ref } = useParentModal()
  const { currentRole } = useWorkspace()
  const [selectedTab, setSelectedTab] = useState<SettingsTab>(defaultTab)

  const canEditWorkspace = currentRole === WorkspaceRole.ADMIN

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
                variant={selectedTab === 'my-account' ? 'solid' : 'ghost'}
                onClick={() => setSelectedTab('my-account')}
                leftIcon={
                  <Avatar
                    name={user.name ?? undefined}
                    src={user.image ?? undefined}
                    boxSize="15px"
                  />
                }
                size="sm"
                justifyContent="flex-start"
                pl="4"
              >
                {t('workspace.settings.modal.menu.myAccount.label')}
              </Button>
              <Button
                variant={selectedTab === 'user-settings' ? 'solid' : 'ghost'}
                onClick={() => setSelectedTab('user-settings')}
                leftIcon={<SettingsIcon />}
                size="sm"
                justifyContent="flex-start"
                pl="4"
              >
                {t('workspace.settings.modal.menu.preferences.label')}
              </Button>
            </Stack>
            <Stack>
              <Text pl="4" color="gray.500">
                {t('workspace.settings.modal.menu.workspace.label')}
              </Text>
              {canEditWorkspace && (
                <Button
                  variant={
                    selectedTab === 'workspace-settings' ? 'solid' : 'ghost'
                  }
                  onClick={() => setSelectedTab('workspace-settings')}
                  leftIcon={
                    <EmojiOrImageIcon
                      icon={workspace.icon}
                      boxSize="15px"
                      defaultIcon={HardDriveIcon}
                    />
                  }
                  size="sm"
                  justifyContent="flex-start"
                  pl="4"
                >
                  {t('workspace.settings.modal.menu.settings.label')}
                </Button>
              )}
              {canEditWorkspace && (
                <Button
                  variant={selectedTab === 'credentials' ? 'solid' : 'ghost'}
                  onClick={() => setSelectedTab('credentials')}
                  leftIcon={<WalletIcon />}
                  size="sm"
                  justifyContent="flex-start"
                  pl="4"
                >
                  Credentials
                </Button>
              )}
              {currentRole !== WorkspaceRole.GUEST && (
                <Button
                  variant={selectedTab === 'members' ? 'solid' : 'ghost'}
                  onClick={() => setSelectedTab('members')}
                  leftIcon={<UsersIcon />}
                  size="sm"
                  justifyContent="flex-start"
                  pl="4"
                >
                  {t('workspace.settings.modal.menu.members.label')}
                </Button>
              )}
              {canEditWorkspace && (
                <Button
                  variant={selectedTab === 'billing' ? 'solid' : 'ghost'}
                  onClick={() => setSelectedTab('billing')}
                  leftIcon={<CreditCardIcon />}
                  size="sm"
                  justifyContent="flex-start"
                  pl="4"
                  overflow="auto"
                >
                  {t('workspace.settings.modal.menu.billingAndUsage.label')}
                </Button>
              )}
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
            <SettingsContent tab={selectedTab} onClose={onClose} />
          </Flex>
        )}
      </ModalContent>
    </Modal>
  )
}

const SettingsContent = ({
  tab,
  onClose,
}: {
  tab: SettingsTab
  onClose: () => void
}) => {
  switch (tab) {
    case 'my-account':
      return <MyAccountForm />
    case 'user-settings':
      return <UserPreferencesForm />
    case 'workspace-settings':
      return <WorkspaceSettingsForm onClose={onClose} />
    case 'members':
      return <MembersList />
    case 'billing':
      return <BillingSettingsLayout />
    case 'credentials':
      return <CredentialsSettingsForm />
    default:
      return null
  }
}
