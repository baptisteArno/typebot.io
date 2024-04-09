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
import { CreateCustomDomainModal } from './CreateCustomDomainModal'
import { useWorkspace } from '@/features/workspace/WorkspaceProvider'
import { useToast } from '@/hooks/useToast'
import { trpc } from '@/lib/trpc'

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
  const { data, refetch } = trpc.customDomains.listCustomDomains.useQuery(
    {
      workspaceId: workspace?.id as string,
    },
    {
      enabled: !!workspace?.id,
      onError: (error) => {
        showToast({
          title: 'Error while fetching custom domains',
          description: error.message,
        })
      },
    }
  )
  const { mutate } = trpc.customDomains.deleteCustomDomain.useMutation({
    onMutate: ({ name }) => {
      setIsDeleting(name)
    },
    onError: (error) => {
      showToast({
        title: 'Error while deleting custom domain',
        description: error.message,
      })
    },
    onSettled: () => {
      setIsDeleting('')
    },
    onSuccess: () => {
      refetch()
    },
  })

  const handleMenuItemClick = (customDomain: string) => () =>
    onCustomDomainSelect(customDomain)

  const handleDeleteDomainClick =
    (domainName: string) => async (e: React.MouseEvent) => {
      if (!workspace) return
      e.stopPropagation()
      mutate({
        name: domainName,
        workspaceId: workspace.id,
      })
    }

  const handleNewDomain = (name: string) => {
    onCustomDomainSelect(name)
  }

  return (
    <Menu isLazy placement="bottom-start">
      {workspace?.id && (
        <CreateCustomDomainModal
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
        <Stack maxH={'35vh'} overflowY="auto" spacing="0">
          {(data?.customDomains ?? []).map((customDomain) => (
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
                as="span"
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
