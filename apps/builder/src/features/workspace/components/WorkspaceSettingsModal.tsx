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
} from '@/components/icons'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { User, Workspace, WorkspaceRole } from '@typebot.io/prisma'
import { useState } from 'react'
import { MembersList } from './MembersList'
import { WorkspaceSettingsForm } from './WorkspaceSettingsForm'
import { useWorkspace } from '../WorkspaceProvider'
import packageJson from '../../../../../../package.json'
import { UserPreferencesForm } from '@/features/account/components/UserPreferencesForm'
import { MyAccountForm } from '@/features/account/components/MyAccountForm'
import { BillingSettingsLayout } from '@/features/billing/components/BillingSettingsLayout'

type Props = {
  isOpen: boolean
  user: User
  workspace: Workspace
  onClose: () => void
}

type SettingsTab =
  | 'my-account'
  | 'user-settings'
  | 'workspace-settings'
  | 'members'
  | 'billing'

export const WorkspaceSettingsModal = ({
  isOpen,
  user,
  workspace,
  onClose,
}: Props) => {
  const { currentRole } = useWorkspace()
  const [selectedTab, setSelectedTab] = useState<SettingsTab>('my-account')

  const canEditWorkspace = currentRole === WorkspaceRole.ADMIN

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <ModalOverlay />
      <ModalContent minH="600px" flexDir="row">
        <Stack
          spacing={8}
          w="200px"
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
                My account
              </Button>
              <Button
                variant={selectedTab === 'user-settings' ? 'solid' : 'ghost'}
                onClick={() => setSelectedTab('user-settings')}
                leftIcon={<SettingsIcon />}
                size="sm"
                justifyContent="flex-start"
                pl="4"
              >
                Preferences
              </Button>
            </Stack>
            <Stack>
              <Text pl="4" color="gray.500">
                Workspace
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
                  Settings
                </Button>
              )}
              <Button
                variant={selectedTab === 'members' ? 'solid' : 'ghost'}
                onClick={() => setSelectedTab('members')}
                leftIcon={<UsersIcon />}
                size="sm"
                justifyContent="flex-start"
                pl="4"
              >
                Members
              </Button>
              {canEditWorkspace && (
                <Button
                  variant={selectedTab === 'billing' ? 'solid' : 'ghost'}
                  onClick={() => setSelectedTab('billing')}
                  leftIcon={<CreditCardIcon />}
                  size="sm"
                  justifyContent="flex-start"
                  pl="4"
                >
                  Billing & Usage
                </Button>
              )}
            </Stack>
          </Stack>

          <Flex justify="center" pt="10">
            <Text color="gray.500" fontSize="xs">
              Version: {packageJson.version}
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
    default:
      return null
  }
}
