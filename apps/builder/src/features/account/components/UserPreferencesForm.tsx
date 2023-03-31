import { Stack, Heading, useColorMode } from '@chakra-ui/react'
import { GraphNavigation } from '@typebot.io/prisma'
import React, { useEffect } from 'react'
import { GraphNavigationRadioGroup } from './GraphNavigationRadioGroup'
import { AppearanceRadioGroup } from './AppearanceRadioGroup'
import { useUser } from '../hooks/useUser'
import { useScopedI18n } from '@/locales'

export const UserPreferencesForm = () => {
  const scopedT = useScopedI18n('account.preferences')
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
        <Heading size="md">{scopedT('graphNavigation.heading')}</Heading>
        <GraphNavigationRadioGroup
          defaultValue={user?.graphNavigation ?? GraphNavigation.TRACKPAD}
          onChange={changeGraphNavigation}
        />
      </Stack>
      <Stack spacing={6}>
        <Heading size="md">{scopedT('appearance.heading')}</Heading>
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
