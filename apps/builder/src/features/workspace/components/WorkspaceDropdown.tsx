import { EmojiOrImageIcon } from '@/components/EmojiOrImageIcon'
import {
  HardDriveIcon,
  ChevronLeftIcon,
  PlusIcon,
  LogOutIcon,
  SearchIcon,
} from '@/components/icons'
import { PlanTag } from '@/features/billing/components/PlanTag'
import { trpc } from '@/lib/trpc'
import { useTranslate } from '@tolgee/react'
import {
  Menu,
  MenuButton,
  Button,
  HStack,
  MenuList,
  MenuItem,
  Text,
  Box,
  Input,
  MenuDivider,
  InputGroup,
  InputLeftElement,
  useDisclosure,
} from '@chakra-ui/react'
import { WorkspaceInApp } from '../WorkspaceProvider'
import { useRef, useState } from 'react'
import { useUser } from '@/features/account/hooks/useUser'

type Props = {
  currentWorkspace?: WorkspaceInApp
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
  const [search, setSearch] = useState('')
  const { t } = useTranslate()
  const { data } = trpc.workspace.listWorkspaces.useQuery()
  const { user } = useUser()

  const menu = useDisclosure()

  const workspaces = data?.workspaces ?? []

  const filteredWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.name.toLowerCase().includes(search.toLowerCase()) &&
      workspace.id !== currentWorkspace?.id
  )

  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const handleOpen = () => {
    setSearch('')
    menu.onOpen()
  }

  const handleMenu = { ...menu, onOpen: handleOpen }

  return (
    <Menu {...handleMenu} placement="bottom-end">
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
      <MenuList onFocus={handleFocus}>
        <Box px="2">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              ref={inputRef}
              placeholder={t('workspace.dropdown.search')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
              }}
            />
          </InputGroup>
        </Box>
        <MenuDivider mb="0" />
        <Box overflowY="auto" maxHeight="480">
          {filteredWorkspaces.map((workspace) => (
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
          {filteredWorkspaces.length === 0 && (
            <Box p="4" textAlign="center">
              {t('workspace.dropdown.empty')}
            </Box>
          )}
        </Box>
        <MenuDivider m="0" />
        <MenuItem onClick={onCreateNewWorkspaceClick} icon={<PlusIcon />}>
          {t('workspace.dropdown.newButton.label')}
        </MenuItem>
        {!user?.cloudChatAuthorization && (
          <MenuItem
            onClick={onLogoutClick}
            icon={<LogOutIcon />}
            color="orange.500"
          >
            {t('workspace.dropdown.logoutButton.label')}
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  )
}
