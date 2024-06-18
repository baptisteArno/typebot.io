import React from 'react'
import { HStack, Flex, Button, useDisclosure } from '@chakra-ui/react'
import { HardDriveIcon, SettingsIcon } from '@/components/icons'
import { useUser } from '@/features/account/hooks/useUser'
import { isNotDefined } from '@sniper.io/lib'
import Link from 'next/link'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { useTranslate } from '@tolgee/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { WorkspaceDropdown } from '@/features/workspace/components/WorkspaceDropdown'
import { WorkspaceSettingsModal } from '@/features/workspace/components/WorkspaceSettingsModal'

export const DashboardHeader = () => {
  const { t } = useTranslate()
  const { user, logOut } = useUser()
  const { workspace, switchWorkspace, createWorkspace } = useWorkspace()

  const { isOpen, onOpen, onClose } = useDisclosure()

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
        <Link href="/snipers" data-testid="sniper-logo">
          <EmojiOrImageIcon
            boxSize="30px"
            icon={workspace?.icon}
            defaultIcon={HardDriveIcon}
          />
        </Link>
        <HStack>
          {user && workspace && !workspace.isPastDue && (
            <WorkspaceSettingsModal
              isOpen={isOpen}
              onClose={onClose}
              user={user}
              workspace={workspace}
            />
          )}
          {!workspace?.isPastDue && (
            <Button
              leftIcon={<SettingsIcon />}
              onClick={onOpen}
              isLoading={isNotDefined(workspace)}
            >
              {t('dashboard.header.settingsButton.label')}
            </Button>
          )}
          <WorkspaceDropdown
            currentWorkspace={workspace}
            onLogoutClick={logOut}
            onCreateNewWorkspaceClick={handleCreateNewWorkspace}
            onWorkspaceSelected={switchWorkspace}
          />
        </HStack>
      </Flex>
    </Flex>
  )
}
