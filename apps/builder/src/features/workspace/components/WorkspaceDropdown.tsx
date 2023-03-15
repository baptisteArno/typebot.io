import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import {
  HardDriveIcon,
  ChevronLeftIcon,
  PlusIcon,
  LogOutIcon,
} from '@/components/icons'
import { PlanTag } from '@/features/billing/components/PlanTag'
import { trpc } from '@/lib/trpc'
import {
  Menu,
  MenuButton,
  Button,
  HStack,
  MenuList,
  MenuItem,
  Text,
} from '@chakra-ui/react'
import { Workspace } from '@typebot.io/schemas'

type Props = {
  currentWorkspace?: Workspace
  onWorkspaceSelected: (workspaceId: string) => void
  onCreateNewWorkspaceClick: () => void
  onLogoutClick: () => void
}

export const WorkspaceDropdown = ({
  currentWorkspace,
  onWorkspaceSelected,
  onLogoutClick,
  onCreateNewWorkspaceClick,
}: Props) => {
  const { data } = trpc.workspace.listWorkspaces.useQuery()

  const workspaces = data?.workspaces ?? []

  return (
    <Menu placement="bottom-end">
      <MenuButton as={Button} variant="outline" px="2">
        <HStack>
          {currentWorkspace && (
            <>
              <Text noOfLines={1} maxW="200px">
                {currentWorkspace.name}
              </Text>
              <PlanTag plan={currentWorkspace.plan} />
            </>
          )}
          <ChevronLeftIcon transform="rotate(-90deg)" />
        </HStack>
      </MenuButton>
      <MenuList>
        {workspaces
          ?.filter((workspace) => workspace.id !== currentWorkspace?.id)
          .map((workspace) => (
            <MenuItem
              key={workspace.id}
              onClick={() => onWorkspaceSelected(workspace.id)}
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
        <MenuItem onClick={onCreateNewWorkspaceClick} icon={<PlusIcon />}>
          New workspace
        </MenuItem>
        <MenuItem
          onClick={onLogoutClick}
          icon={<LogOutIcon />}
          color="orange.500"
        >
          Log out
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
