import React from 'react'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  Flex,
  SkeletonCircle,
  Button,
  useDisclosure,
} from '@chakra-ui/react'
import {
  ChevronLeftIcon,
  HardDriveIcon,
  LogOutIcon,
  PlusIcon,
  SettingsIcon,
} from '@/components/icons'
import { signOut } from 'next-auth/react'
import { useUser } from '@/features/account'
import { useWorkspace } from '@/features/workspace'
import { isNotDefined } from 'utils'
import Link from 'next/link'
import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import { TypebotLogo } from '@/components/TypebotLogo'
import { PlanTag } from '@/features/billing'
import { WorkspaceSettingsModal } from '@/features/workspace'

export const DashboardHeader = () => {
  const { user } = useUser()

  const { workspace, workspaces, switchWorkspace, createWorkspace } =
    useWorkspace()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleLogOut = () => {
    localStorage.removeItem('workspaceId')
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
          <TypebotLogo w="30px" />
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
            Settings & Members
          </Button>
          <Menu placement="bottom-end">
            <MenuButton as={Button} variant="outline" px="2">
              <HStack>
                <SkeletonCircle
                  isLoaded={workspace !== undefined}
                  alignItems="center"
                  display="flex"
                  boxSize="20px"
                >
                  <EmojiOrImageIcon
                    boxSize="20px"
                    icon={workspace?.icon}
                    defaultIcon={HardDriveIcon}
                  />
                </SkeletonCircle>
                {workspace && (
                  <>
                    <Text noOfLines={1} maxW="200px">
                      {workspace.name}
                    </Text>
                    <PlanTag plan={workspace.plan} />
                  </>
                )}
                <ChevronLeftIcon transform="rotate(-90deg)" />
              </HStack>
            </MenuButton>
            <MenuList>
              {workspaces
                ?.filter((w) => w.id !== workspace?.id)
                .map((workspace) => (
                  <MenuItem
                    key={workspace.id}
                    onClick={() => switchWorkspace(workspace.id)}
                  >
                    <HStack>
                      <EmojiOrImageIcon
                        icon={workspace.icon}
                        boxSize="16px"
                        defaultIcon={HardDriveIcon}
                      />
                      <Text>{workspace.name}</Text>
                      <PlanTag plan={workspace.plan} />
                    </HStack>
                  </MenuItem>
                ))}
              <MenuItem onClick={handleCreateNewWorkspace} icon={<PlusIcon />}>
                New workspace
              </MenuItem>
              <MenuItem
                onClick={handleLogOut}
                icon={<LogOutIcon />}
                color="orange.500"
              >
                Log out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Flex>
  )
}
