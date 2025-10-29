import { useTolgee, useTranslate } from "@tolgee/react";
import { GraphNavigation } from "@typebot.io/prisma/enum";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import type { GroupTitlesAutoGeneration } from "@typebot.io/user/schemas";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { BasicSelect } from "@/components/inputs/BasicSelect";
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
  const { setTheme } = useTheme();

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
    setTheme(value);
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
    <div className="flex flex-col gap-12">
      <div className="flex items-center gap-4">
        <h3>{t("account.preferences.language.heading")}</h3>
        <div className="flex items-center">
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
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <h3>{t("account.preferences.graphNavigation.heading")}</h3>
        <GraphNavigationRadioGroup
          defaultValue={user?.graphNavigation ?? GraphNavigation.MOUSE}
          onChange={changeGraphNavigation}
        />
      </div>
      <div className="flex flex-col gap-6">
        <h3>{t("account.preferences.appearance.heading")}</h3>
        <AppearanceRadioGroup
          defaultValue={
            user?.preferredAppAppearance
              ? user.preferredAppAppearance
              : "system"
          }
          onChange={changeAppearance}
        />
      </div>
      <VideoOnboardingPopover
        type="groupTitlesAutoGeneration"
        isEnabled={user?.groupTitlesAutoGeneration?.isEnabled ?? false}
        side="top"
      >
        <Field.Container>
          <Field.Root className="flex-row items-center">
            <Switch
              checked={user?.groupTitlesAutoGeneration?.isEnabled}
              onCheckedChange={(isEnabled) => {
                updateGroupTitlesGenParams({ isEnabled });
              }}
            />
            <Field.Label>
              {t("account.preferences.groupTitlesAutoGeneration.label")}
            </Field.Label>
          </Field.Root>
          {user?.groupTitlesAutoGeneration && (
            <GroupTitlesAutoGenForm
              userId={user.id}
              values={user.groupTitlesAutoGeneration}
              onChange={updateGroupTitlesGenParams}
            />
          )}
        </Field.Container>
      </VideoOnboardingPopover>
    </div>
  );
};
