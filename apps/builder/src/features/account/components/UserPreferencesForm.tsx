import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { ChevronDownIcon } from "@/components/icons";
import {
  Button,
  HStack,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
} from "@chakra-ui/react";
import { useTolgee, useTranslate } from "@tolgee/react";
import { GraphNavigation } from "@typebot.io/prisma/enum";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useUser } from "../hooks/useUser";
import { AppearanceRadioGroup } from "./AppearanceRadioGroup";
import { GraphNavigationRadioGroup } from "./GraphNavigationRadioGroup";

const localeHumanReadable = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  "pt-BR": "Português (BR)",
  ro: "Română",
  es: "Español",
  it: "Italiano",
} as const;

export const UserPreferencesForm = () => {
  const { getLanguage } = useTolgee();
  const router = useRouter();
  const { t } = useTranslate();
  const { user, updateUser } = useUser();

  useEffect(() => {
    if (!user?.graphNavigation)
      updateUser({ graphNavigation: GraphNavigation.MOUSE });
  }, [updateUser, user?.graphNavigation]);

  const changeAppearance = async (value: string) => {
    updateUser({ preferredAppAppearance: value });
  };

  const updateLocale = (locale: keyof typeof localeHumanReadable) => () => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    router.replace(
      {
        pathname: router.pathname,
        query: router.query,
      },
      undefined,
      { locale },
    );
  };

  const changeGraphNavigation = async (value: string) => {
    updateUser({ graphNavigation: value as GraphNavigation });
  };

  const currentLanguage = getLanguage();

  return (
    <Stack spacing={12}>
      <HStack spacing={4}>
        <Heading size="md">{t("account.preferences.language.heading")}</Heading>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {currentLanguage
              ? localeHumanReadable[
                  currentLanguage as keyof typeof localeHumanReadable
                ]
              : "Loading..."}
          </MenuButton>
          <MenuList>
            {Object.keys(localeHumanReadable).map((locale) => (
              <MenuItem
                key={locale}
                onClick={updateLocale(
                  locale as keyof typeof localeHumanReadable,
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
        {currentLanguage !== "en" && (
          <MoreInfoTooltip>
            {t("account.preferences.language.tooltip")}
          </MoreInfoTooltip>
        )}
      </HStack>
      <Stack spacing={6}>
        <Heading size="md">
          {t("account.preferences.graphNavigation.heading")}
        </Heading>
        <GraphNavigationRadioGroup
          defaultValue={user?.graphNavigation ?? GraphNavigation.MOUSE}
          onChange={changeGraphNavigation}
        />
      </Stack>

      <Stack spacing={6}>
        <Heading size="md">
          {t("account.preferences.appearance.heading")}
        </Heading>
        <AppearanceRadioGroup
          defaultValue={
            user?.preferredAppAppearance
              ? user.preferredAppAppearance
              : "system"
          }
          onChange={changeAppearance}
        />
      </Stack>
    </Stack>
  );
};
