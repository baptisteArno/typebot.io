import { Stack, Heading } from '@chakra-ui/react'
import { GraphNavigation } from '@typebot.io/prisma'
import React, { useEffect } from 'react'
import { AppearanceRadioGroup } from './AppearanceRadioGroup'
import { useUser } from '../hooks/useUser'
import { useTranslate } from '@tolgee/react'
import { GraphNavigationRadioGroup } from './GraphNavigationRadioGroup'

export const UserPreferencesForm = () => {
  const { t } = useTranslate()
  const { user, updateUser } = useUser()

  useEffect(() => {
    if (!user?.graphNavigation)
      updateUser({ graphNavigation: GraphNavigation.MOUSE })
  }, [updateUser, user?.graphNavigation])

  const changeAppearance = async (value: string) => {
    updateUser({ preferredAppAppearance: value })
  }

  const changeGraphNavigation = async (value: string) => {
    updateUser({ graphNavigation: value as GraphNavigation })
  }

  return (
    <Stack spacing={12}>
      <Stack spacing={6}>
        <Heading size="md">
          {t('account.preferences.graphNavigation.heading')}
        </Heading>
        <GraphNavigationRadioGroup
          defaultValue={user?.graphNavigation ?? GraphNavigation.MOUSE}
          onChange={changeGraphNavigation}
        />
      </Stack>

      <Stack spacing={6}>
        <Heading size="md">
          {t('account.preferences.appearance.heading')}
        </Heading>
        <AppearanceRadioGroup
          defaultValue={
            user?.preferredAppAppearance
              ? user.preferredAppAppearance
              : 'system'
          }
          onChange={changeAppearance}
        />
      </Stack>
    </Stack>
  )
}
