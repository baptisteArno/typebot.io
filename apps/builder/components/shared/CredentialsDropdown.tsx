import {
  Button,
  Menu,
  MenuButton,
  MenuButtonProps,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ChevronLeftIcon, PlusIcon } from 'assets/icons'
import React, { useEffect, useMemo } from 'react'
import { useUser } from 'contexts/UserContext'
import { CredentialsType } from 'db'
import { useRouter } from 'next/router'

type Props = Omit<MenuButtonProps, 'type'> & {
  type: CredentialsType
  currentCredentialsId?: string
  onCredentialsSelect: (credentialId: string) => void
  onCreateNewClick: () => void
}

export const CredentialsDropdown = ({
  type,
  currentCredentialsId,
  onCredentialsSelect,
  onCreateNewClick,
  ...props
}: Props) => {
  const router = useRouter()
  const { credentials } = useUser()

  const credentialsList = useMemo(() => {
    return credentials.filter((credential) => credential.type === type)
  }, [type, credentials])

  const currentCredential = useMemo(
    () => credentials.find((c) => c.id === currentCredentialsId),
    [currentCredentialsId, credentials]
  )

  const handleMenuItemClick = (credentialId: string) => () => {
    onCredentialsSelect(credentialId)
  }

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
        <Text isTruncated overflowY="visible" h="20px">
          {currentCredential ? currentCredential.name : 'Select an account'}
        </Text>
      </MenuButton>
      <MenuList maxW="500px">
        <Stack maxH={'35vh'} overflowY="scroll" spacing="0">
          {credentialsList.map((credentials) => (
            <MenuItem
              key={credentials.id}
              maxW="500px"
              overflow="hidden"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              onClick={handleMenuItemClick(credentials.id)}
            >
              {credentials.name}
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
