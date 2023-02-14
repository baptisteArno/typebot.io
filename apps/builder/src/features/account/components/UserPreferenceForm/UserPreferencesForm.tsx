import { Stack, Heading, useColorMode } from '@chakra-ui/react'
import { useUser } from '@/features/account'
import { GraphNavigation } from 'db'
import React, { useEffect } from 'react'
import { GraphNavigationRadioGroup } from './GraphNavigationRadioGroup'
import { AppearanceRadioGroup } from './AppearanceRadioGroup'

export const UserPreferencesForm = () => {
  const { colorMode, setColorMode } = useColorMode()
  const { user, updateUser } = useUser()

  useEffect(() => {
    if (!user?.graphNavigation)
      updateUser({ graphNavigation: GraphNavigation.TRACKPAD })
  }, [updateUser, user?.graphNavigation])

  const changeGraphNavigation = async (value: string) => {
    updateUser({ graphNavigation: value as GraphNavigation })
  }

  const changeAppearance = async (value: string) => {
    setColorMode(value)
    updateUser({ preferredAppAppearance: value })
  }

  return (
    <Stack spacing={12}>
      <Stack spacing={6}>
        <Heading size="md">Editor Navigation</Heading>
        <GraphNavigationRadioGroup
          defaultValue={user?.graphNavigation ?? GraphNavigation.TRACKPAD}
          onChange={changeGraphNavigation}
        />
      </Stack>
      <Stack spacing={6}>
        <Heading size="md">Appearance</Heading>
        <AppearanceRadioGroup
          defaultValue={
            user?.preferredAppAppearance
              ? user.preferredAppAppearance
              : colorMode
          }
          onChange={changeAppearance}
        />
      </Stack>
    </Stack>
  )
}
