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
  useToast,
} from '@chakra-ui/react'
import { ChevronLeftIcon, PlusIcon, TrashIcon } from 'assets/icons'
import React, { useState } from 'react'
import { useUser } from 'contexts/UserContext'
import { CustomDomainModal } from './CustomDomainModal'
import { deleteCustomDomain, useCustomDomains } from 'services/user'

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
  const { user } = useUser()
  const { customDomains, mutate } = useCustomDomains({
    userId: user?.id,
    onError: (error) =>
      toast({ title: error.name, description: error.message }),
  })
  const toast = useToast({
    position: 'top-right',
    status: 'error',
  })

  const handleMenuItemClick = (customDomain: string) => () =>
    onCustomDomainSelect(customDomain)

  const handleDeleteDomainClick =
    (domainName: string) => async (e: React.MouseEvent) => {
      if (!user) return
      e.stopPropagation()
      setIsDeleting(domainName)
      const { error } = await deleteCustomDomain(user.id, domainName)
      setIsDeleting('')
      if (error) return toast({ title: error.name, description: error.message })
      mutate({
        customDomains: (customDomains ?? []).filter(
          (cd) => cd.name !== domainName
        ),
      })
    }

  const handleNewDomain = (domain: string) => {
    if (!user) return
    mutate({
      customDomains: [
        ...(customDomains ?? []),
        { name: domain, ownerId: user?.id },
      ],
    })
    handleMenuItemClick(domain)()
  }

  return (
    <Menu isLazy placement="bottom-start" matchWidth>
      {user?.id && (
        <CustomDomainModal
          userId={user.id}
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
        <Text noOfLines={0} overflowY="visible" h="20px">
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
