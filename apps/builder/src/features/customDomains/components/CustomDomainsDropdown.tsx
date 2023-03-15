import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { ChevronLeftIcon, PlusIcon, TrashIcon } from '@/components/icons'
import React, { useState } from 'react'
import { CustomDomainModal } from './CustomDomainModal'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { useCustomDomains } from '../hooks/useCustomDomains'
import { deleteCustomDomainQuery } from '../queries/deleteCustomDomainQuery'

type Props = Omit<MenuButtonProps, 'type'> & {
  currentCustomDomain?: string
  onCustomDomainSelect: (domain: string) => void
}

export const CustomDomainsDropdown = ({
  currentCustomDomain,
  onCustomDomainSelect,
  ...props
}: Props) => {
  const [isDeleting, setIsDeleting] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { workspace } = useWorkspace()
  const { showToast } = useToast()
  const { customDomains, mutate } = useCustomDomains({
    workspaceId: workspace?.id,
    onError: (error) =>
      showToast({ title: error.name, description: error.message }),
  })

  const handleMenuItemClick = (customDomain: string) => () =>
    onCustomDomainSelect(customDomain)

  const handleDeleteDomainClick =
    (domainName: string) => async (e: React.MouseEvent) => {
      if (!workspace) return
      e.stopPropagation()
      setIsDeleting(domainName)
      const { error } = await deleteCustomDomainQuery(workspace.id, domainName)
      setIsDeleting('')
      if (error)
        return showToast({ title: error.name, description: error.message })
      mutate({
        customDomains: (customDomains ?? []).filter(
          (cd) => cd.name !== domainName
        ),
      })
    }

  const handleNewDomain = (domain: string) => {
    if (!workspace) return
    mutate({
      customDomains: [
        ...(customDomains ?? []),
        { name: domain, workspaceId: workspace?.id },
      ],
    })
    handleMenuItemClick(domain)()
  }

  return (
    <Menu isLazy placement="bottom-start" matchWidth>
      {workspace?.id && (
        <CustomDomainModal
          workspaceId={workspace.id}
          isOpen={isOpen}
          onClose={onClose}
          onNewDomain={handleNewDomain}
        />
      )}
      <MenuButton
        as={Button}
        rightIcon={<ChevronLeftIcon transform={'rotate(-90deg)'} />}
        colorScheme="gray"
        justifyContent="space-between"
        textAlign="left"
        {...props}
      >
        <Text noOfLines={1} overflowY="visible" h="20px">
          {currentCustomDomain ?? 'Add my domain'}
        </Text>
      </MenuButton>
      <MenuList maxW="500px" shadow="lg">
        <Stack maxH={'35vh'} overflowY="scroll" spacing="0">
          {(customDomains ?? []).map((customDomain) => (
            <Button
              role="menuitem"
              minH="40px"
              key={customDomain.name}
              onClick={handleMenuItemClick(customDomain.name)}
              fontSize="16px"
              fontWeight="normal"
              rounded="none"
              colorScheme="gray"
              variant="ghost"
              justifyContent="space-between"
            >
              {customDomain.name}
              <IconButton
                icon={<TrashIcon />}
                aria-label="Remove domain"
                size="xs"
                onClick={handleDeleteDomainClick(customDomain.name)}
                isLoading={isDeleting === customDomain.name}
              />
            </Button>
          ))}
          <MenuItem
            maxW="500px"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            icon={<PlusIcon />}
            onClick={onOpen}
          >
            Connect new
          </MenuItem>
        </Stack>
      </MenuList>
    </Menu>
  )
}
