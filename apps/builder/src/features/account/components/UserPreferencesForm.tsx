import {
  Stack,
  Heading,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
} from '@chakra-ui/react'
import { GraphNavigation } from '@typebot.io/prisma'
import React, { useEffect } from 'react'
import { GraphNavigationRadioGroup } from './GraphNavigationRadioGroup'
import { AppearanceRadioGroup } from './AppearanceRadioGroup'
import { useUser } from '../hooks/useUser'
import { useChangeLocale, useCurrentLocale, useScopedI18n } from '@/locales'
import { ChevronDownIcon } from '@/components/icons'
import { MoreInfoTooltip } from '@/components/MoreInfoTooltip'

const localeHumanReadable = {
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
} as const

export const UserPreferencesForm = () => {
  const scopedT = useScopedI18n('account.preferences')
  const { colorMode, setColorMode } = useColorMode()
  const { user, updateUser } = useUser()
  const changeLocale = useChangeLocale()
  const currentLocale = useCurrentLocale()

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

  const updateLocale = (locale: keyof typeof localeHumanReadable) => () => {
    changeLocale(locale)
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
  }

  return (
    <Stack spacing={12}>
      <HStack spacing={4}>
        <Heading size="md">{scopedT('language.heading')}</Heading>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {localeHumanReadable[currentLocale]}
          </MenuButton>
          <MenuList>
            {Object.keys(localeHumanReadable).map((locale) => (
              <MenuItem
                key={locale}
                onClick={updateLocale(
                  locale as keyof typeof localeHumanReadable
                )}
              >
                {
                  localeHumanReadable[
                    locale as keyof typeof localeHumanReadable
                  ]
                }
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        {currentLocale !== 'en' && (
          <MoreInfoTooltip>{scopedT('language.tooltip')}</MoreInfoTooltip>
        )}
      </HStack>
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
