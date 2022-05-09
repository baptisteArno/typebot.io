import React from 'react'
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  Flex,
  Avatar,
  SkeletonCircle,
  Skeleton,
} from '@chakra-ui/react'
import { TypebotLogo } from 'assets/logos'
import { NextChakraLink } from 'components/nextChakra/NextChakraLink'
import { LogOutIcon, SettingsIcon } from 'assets/icons'
import { signOut } from 'next-auth/react'
import { useUser } from 'contexts/UserContext'
import { useTranslation } from 'next-i18next'

export const DashboardHeader = () => {
  const { user } = useUser()

  const handleLogOut = () => {
    signOut()
  }

  const { t } = useTranslation('common')

  return (
    <Flex w="full" borderBottomWidth="1px" justify="center">
      <Flex
        justify="space-between"
        alignItems="center"
        h="16"
        maxW="1000px"
        flex="1"
      >
        <NextChakraLink
          className="w-24"
          href="/typebots"
          data-testid="authenticated"
        >
          <TypebotLogo w="30px" />
        </NextChakraLink>
        <Menu>
          <MenuButton>
            <HStack>
              <Skeleton isLoaded={user !== undefined}>
                { t('text') }
                { t('nti')}
                nome
                <Text>{user?.name}</Text>
              </Skeleton>
              <SkeletonCircle isLoaded={user !== undefined}>
                <Avatar
                  boxSize="35px"
                  name={user?.name ?? undefined}
                  src={user?.image ?? undefined}
                />
              </SkeletonCircle>
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem
              as={NextChakraLink}
              href="/account"
              icon={<SettingsIcon />}
            >
              My account
            </MenuItem>
            <MenuItem onClick={handleLogOut} icon={<LogOutIcon />}>
              Log out
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  )
}
