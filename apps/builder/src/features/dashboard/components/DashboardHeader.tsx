import React from 'react'
import { HStack, Flex, Button, useDisclosure } from '@chakra-ui/react'
import { HardDriveIcon, SettingsIcon } from '@/components/icons'
import { signOut } from 'next-auth/react'
import { useUser } from '@/features/account'
import { useWorkspace, WorkspaceDropdown } from '@/features/workspace'
import { isNotDefined } from 'utils'
import Link from 'next/link'
import { WorkspaceSettingsModal } from '@/features/workspace'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { useScopedI18n } from '@/locales'

export const DashboardHeader = () => {
  const scopedT = useScopedI18n('dashboard.header')
  const { user } = useUser()
  const { workspace, switchWorkspace, createWorkspace } = useWorkspace()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleLogOut = () => {
    signOut()
  }

  const handleCreateNewWorkspace = () =>
    createWorkspace(user?.name ?? undefined)

  return (
    <Flex w="full" borderBottomWidth="1px" justify="center">
      <Flex
        justify="space-between"
        alignItems="center"
        h="16"
        maxW="1000px"
        flex="1"
      >
        <Link href="/typebots" data-testid="typebot-logo">
          <EmojiOrImageIcon
            boxSize="30px"
            icon={workspace?.icon}
            defaultIcon={HardDriveIcon}
          />
        </Link>
        <HStack>
          {user && workspace && (
            <WorkspaceSettingsModal
              isOpen={isOpen}
              onClose={onClose}
              user={user}
              workspace={workspace}
            />
          )}
          <Button
            leftIcon={<SettingsIcon />}
            onClick={onOpen}
            isLoading={isNotDefined(workspace)}
          >
            {scopedT('settingsButton.label')}
          </Button>
          <WorkspaceDropdown
            currentWorkspace={workspace}
            onLogoutClick={handleLogOut}
            onCreateNewWorkspaceClick={handleCreateNewWorkspace}
            onWorkspaceSelected={switchWorkspace}
          />
        </HStack>
      </Flex>
    </Flex>
  )
}
