import { Heading, HStack, Stack } from "@chakra-ui/react";
import { useTolgee, useTranslate } from "@tolgee/react";
import { GraphNavigation } from "@typebot.io/prisma/enum";
import type { GroupTitlesAutoGeneration } from "@typebot.io/user/schemas";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { VideoOnboardingPopover } from "@/features/onboarding/components/VideoOnboardingPopover";
import { setLocaleInCookies } from "../helpers/setLocaleInCookies";
import { useUser } from "../hooks/useUser";
import { AppearanceRadioGroup } from "./AppearanceRadioGroup";
import { GraphNavigationRadioGroup } from "./GraphNavigationRadioGroup";
import { GroupTitlesAutoGenForm } from "./GroupTitlesAutoGenForm";

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

  const updateLocale = (locale: keyof typeof localeHumanReadable) => {
    updateUser({ preferredLanguage: locale });

    setLocaleInCookies(locale);
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

  const updateGroupTitlesGenParams = (
    params: Partial<GroupTitlesAutoGeneration>,
  ) => {
    if (!user?.id) return;
    updateUser({
      groupTitlesAutoGeneration: {
        ...user.groupTitlesAutoGeneration,
        ...params,
      },
    });
  };

  return (
    <Stack spacing={12}>
      <HStack spacing={4}>
        <Heading size="md">{t("account.preferences.language.heading")}</Heading>
        <BasicSelect
          items={Object.entries(localeHumanReadable).map(([key, value]) => ({
            label: value,
            value: key as keyof typeof localeHumanReadable,
          }))}
          value={currentLanguage as keyof typeof localeHumanReadable}
          onChange={updateLocale}
        />
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

      <VideoOnboardingPopover
        type="groupTitlesAutoGeneration"
        isEnabled={user?.groupTitlesAutoGeneration?.isEnabled ?? false}
        side="top"
      >
        <SwitchWithRelatedSettings
          label={t("account.preferences.groupTitlesAutoGeneration.label")}
          initialValue={user?.groupTitlesAutoGeneration?.isEnabled}
          onCheckChange={(isEnabled) => {
            updateGroupTitlesGenParams({ isEnabled });
          }}
        >
          {user?.groupTitlesAutoGeneration && (
            <GroupTitlesAutoGenForm
              userId={user.id}
              values={user.groupTitlesAutoGeneration}
              onChange={updateGroupTitlesGenParams}
            />
          )}
        </SwitchWithRelatedSettings>
      </VideoOnboardingPopover>
    </Stack>
  );
};
