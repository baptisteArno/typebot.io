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
} from '@chakra-ui/react'
import { ChevronLeftIcon, PlusIcon, TrashIcon } from '@/components/icons'
import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { CredentialsType } from 'models'
import { useWorkspace } from '@/features/workspace'
import { useToast } from '../../../hooks/useToast'
import { deleteCredentialsQuery, useCredentials } from '@/features/credentials'

type Props = Omit<MenuButtonProps, 'type'> & {
  type: CredentialsType
  currentCredentialsId?: string
  onCredentialsSelect: (credentialId?: string) => void
  onCreateNewClick: () => void
  defaultCredentialLabel?: string
  refreshDropdownKey?: number
}

export const CredentialsDropdown = ({
  type,
  currentCredentialsId,
  onCredentialsSelect,
  onCreateNewClick,
  defaultCredentialLabel,
  refreshDropdownKey,
  ...props
}: Props) => {
  const router = useRouter()
  const { workspace } = useWorkspace()
  const { showToast } = useToast()
  const { credentials, mutate } = useCredentials({
    workspaceId: workspace?.id,
  })
  const [isDeleting, setIsDeleting] = useState<string>()

  const defaultCredentialsLabel = defaultCredentialLabel ?? `Select an account`

  const credentialsList = useMemo(() => {
    return credentials.filter((credential) => credential.type === type)
  }, [type, credentials])

  const currentCredential = useMemo(
    () => credentials.find((c) => c.id === currentCredentialsId),
    [currentCredentialsId, credentials]
  )

  const handleMenuItemClick = (credentialsId: string) => () => {
    onCredentialsSelect(credentialsId)
  }

  useEffect(() => {
    if ((refreshDropdownKey ?? 0) > 0) mutate({ credentials })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshDropdownKey])

  useEffect(() => {
    if (!router.isReady) return
    if (router.query.credentialsId) {
      handleMenuItemClick(router.query.credentialsId.toString())()
      clearQueryParams()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  const clearQueryParams = () => {
    const hasQueryParams = router.asPath.includes('?')
    if (hasQueryParams)
      router.push(router.asPath.split('?')[0], undefined, { shallow: true })
  }

  const handleDeleteDomainClick =
    (credentialsId: string) => async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!workspace?.id) return
      setIsDeleting(credentialsId)
      const { error } = await deleteCredentialsQuery(
        workspace.id,
        credentialsId
      )
      setIsDeleting(undefined)
      if (error)
        return showToast({ title: error.name, description: error.message })
      onCredentialsSelect(undefined)
      mutate({ credentials: credentials.filter((c) => c.id !== credentialsId) })
    }

  return (
    <Menu isLazy placement="bottom-end" matchWidth>
      <MenuButton
        as={Button}
        rightIcon={<ChevronLeftIcon transform={'rotate(-90deg)'} />}
        colorScheme="gray"
        justifyContent="space-between"
        textAlign="left"
        {...props}
      >
        <Text noOfLines={1} overflowY="visible" h="20px">
          {currentCredential ? currentCredential.name : defaultCredentialsLabel}
        </Text>
      </MenuButton>
      <MenuList maxW="500px">
        <Stack maxH={'35vh'} overflowY="scroll" spacing="0">
          {defaultCredentialLabel && (
            <MenuItem
              maxW="500px"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              onClick={handleMenuItemClick('default')}
            >
              {defaultCredentialLabel}
            </MenuItem>
          )}
          {credentialsList.map((credentials) => (
            <MenuItem
              role="menuitem"
              minH="40px"
              key={credentials.id}
              onClick={handleMenuItemClick(credentials.id)}
              fontSize="16px"
              fontWeight="normal"
              rounded="none"
              justifyContent="space-between"
            >
              {credentials.name}
              <IconButton
                icon={<TrashIcon />}
                aria-label="Remove credentials"
                size="xs"
                onClick={handleDeleteDomainClick(credentials.id)}
                isLoading={isDeleting === credentials.id}
              />
            </MenuItem>
          ))}
          <MenuItem
            maxW="500px"
            overflow="hidden"
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            icon={<PlusIcon />}
            onClick={onCreateNewClick}
          >
            Connect new
          </MenuItem>
        </Stack>
      </MenuList>
    </Menu>
  )
}
