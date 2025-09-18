import React from 'react'
import {
  HStack,
  Flex,
  Button,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react'
import { SettingsIcon } from '@/components/icons'
import { useUser } from '@/features/account/hooks/useUser'
import { isNotDefined } from '@typebot.io/lib'
import { useTranslate } from '@tolgee/react'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { WorkspaceSettingsModal } from '@/features/workspace/components/WorkspaceSettingsModal'
import { ParentModalProvider } from '@/features/graph/providers/ParentModalProvider'
import { useRouter } from 'next/router'
import { ChevronLeftIcon } from './../../../components/icons'
import { WorkspaceDropdown } from '@/features/workspace/components/WorkspaceDropdown'

export const DashboardHeader = () => {
  const { t } = useTranslate()
  const { asPath, back, push } = useRouter()
  const { workspace, switchWorkspace, createWorkspace } = useWorkspace()
  const { user, logOut } = useUser()

  const isRedirectFromCredentialsCreation = asPath.includes('preferences')

  const { isOpen, onOpen, onClose } = useDisclosure({
    defaultIsOpen: isRedirectFromCredentialsCreation,
  })
  const handleCreateNewWorkspace = () =>
    createWorkspace(user?.name ?? undefined)

  const handleBackNavigation = () => {
    // Check if we can go back in browser history
    if (window.history.length > 1) {
      back()
    } else {
      // If no history, navigate to homepage
      push('/')
    }
  }

  return (
    <Flex w="full" borderBottomWidth="1px" justify="center">
      <Flex
        justify="space-between"
        alignItems="center"
        h="16"
        maxW="1000px"
        flex="1"
      >
        <IconButton
          aria-label="Navigate back"
          icon={<ChevronLeftIcon fontSize={25} />}
          onClick={handleBackNavigation}
          size="sm"
        />
        <HStack>
          {user && workspace && !workspace.isPastDue && (
            <ParentModalProvider>
              <WorkspaceSettingsModal
                isOpen={isOpen}
                onClose={onClose}
                user={user}
                workspace={workspace}
                defaultTab={
                  isRedirectFromCredentialsCreation ? 'credentials' : undefined
                }
              />
            </ParentModalProvider>
          )}
          {!workspace?.isPastDue && (
            <Button
              leftIcon={<SettingsIcon />}
              onClick={onOpen}
              isLoading={isNotDefined(workspace)}
            >
              {t('workspace.settings.modal.menu.preferences.label')}
            </Button>
          )}
          {user?.isAdmin && (
            <WorkspaceDropdown
              currentWorkspace={workspace}
              onLogoutClick={logOut}
              onCreateNewWorkspaceClick={handleCreateNewWorkspace}
              onWorkspaceSelected={switchWorkspace}
            />
          )}
        </HStack>
      </Flex>
    </Flex>
  )
}
