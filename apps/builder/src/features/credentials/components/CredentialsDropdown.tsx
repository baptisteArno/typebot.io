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
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useToast } from '../../../hooks/useToast'
import { Credentials } from '@typebot.io/schemas'
import { trpc } from '@/lib/trpc'

type Props = Omit<MenuButtonProps, 'type'> & {
  type: Credentials['type']
  workspaceId: string
  currentCredentialsId?: string
  onCredentialsSelect: (credentialId?: string) => void
  onCreateNewClick: () => void
  defaultCredentialLabel?: string
}

export const CredentialsDropdown = ({
  type,
  workspaceId,
  currentCredentialsId,
  onCredentialsSelect,
  onCreateNewClick,
  defaultCredentialLabel,
  ...props
}: Props) => {
  const router = useRouter()
  const { showToast } = useToast()
  const { data, refetch } = trpc.credentials.listCredentials.useQuery({
    workspaceId,
    type,
  })
  const [isDeleting, setIsDeleting] = useState<string>()
  const { mutate } = trpc.credentials.deleteCredentials.useMutation({
    onMutate: ({ credentialsId }) => {
      setIsDeleting(credentialsId)
    },
    onError: (error) => {
      showToast({
        description: error.message,
      })
    },
    onSuccess: ({ credentialsId }) => {
      if (credentialsId === currentCredentialsId) onCredentialsSelect(undefined)
      refetch()
    },
    onSettled: () => {
      setIsDeleting(undefined)
    },
  })

  const defaultCredentialsLabel = defaultCredentialLabel ?? `Select an account`

  const currentCredential = data?.credentials.find(
    (c) => c.id === currentCredentialsId
  )

  const handleMenuItemClick = useCallback(
    (credentialsId: string) => () => {
      onCredentialsSelect(credentialsId)
    },
    [onCredentialsSelect]
  )

  const clearQueryParams = useCallback(() => {
    const hasQueryParams = router.asPath.includes('?')
    if (hasQueryParams)
      router.push(router.asPath.split('?')[0], undefined, { shallow: true })
  }, [router])

  useEffect(() => {
    if (!router.isReady) return
    if (router.query.credentialsId) {
      handleMenuItemClick(router.query.credentialsId.toString())()
      clearQueryParams()
    }
  }, [
    clearQueryParams,
    handleMenuItemClick,
    router.isReady,
    router.query.credentialsId,
  ])

  const deleteCredentials =
    (credentialsId: string) => async (e: React.MouseEvent) => {
      e.stopPropagation()
      mutate({ workspaceId, credentialsId })
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
          {data?.credentials.map((credentials) => (
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
                onClick={deleteCredentials(credentials.id)}
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
