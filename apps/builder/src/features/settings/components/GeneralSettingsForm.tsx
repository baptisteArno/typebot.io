import { T, useTranslate } from "@tolgee/react";
import { isDefined } from "@typebot.io/lib/utils";
import {
  defaultSettings,
  rememberUserStorages,
} from "@typebot.io/settings/constants";
import type { Settings, SystemMessages } from "@typebot.io/settings/schemas";
import { Accordion } from "@typebot.io/ui/components/Accordion";
import { Badge } from "@typebot.io/ui/components/Badge";
import { Field } from "@typebot.io/ui/components/Field";
import { MoreInfoTooltip } from "@typebot.io/ui/components/MoreInfoTooltip";
import { Switch } from "@typebot.io/ui/components/Switch";
import { BasicSelect } from "@/components/inputs/BasicSelect";
import { SystemMessagesForm } from "./SystemMessagesForm";

type Props = {
  generalSettings: Settings["general"] | undefined;
  onGeneralSettingsChange: (generalSettings: Settings["general"]) => void;
};

export const GeneralSettingsForm = ({
  generalSettings,
  onGeneralSettingsChange,
}: Props) => {
  const { t } = useTranslate();
  const toggleRememberUser = (isEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      rememberUser: {
        ...generalSettings?.rememberUser,
        isEnabled,
      },
    });

  const handleInputPrefillChange = (isInputPrefillEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isInputPrefillEnabled,
    });

  const handleHideQueryParamsChange = (isHideQueryParamsEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      isHideQueryParamsEnabled,
    });

  const updateRememberUserStorage = (
    storage: NonNullable<
      NonNullable<Settings["general"]>["rememberUser"]
    >["storage"],
  ) =>
    onGeneralSettingsChange({
      ...generalSettings,
      rememberUser: {
        ...generalSettings?.rememberUser,
        storage,
      },
    });

  const updateSystemMessages = (systemMessages: SystemMessages) => {
    onGeneralSettingsChange({
      ...generalSettings,
      systemMessages,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Field.Root className="flex-row items-center">
        <Switch
          checked={
            generalSettings?.isInputPrefillEnabled ??
            defaultSettings.general.isInputPrefillEnabled
          }
          onCheckedChange={handleInputPrefillChange}
        />
        <Field.Label>
          {t("settings.sideMenu.general.prefillInput")}{" "}
          <MoreInfoTooltip>
            {t("settings.sideMenu.general.prefillInput.tooltip")}
          </MoreInfoTooltip>
        </Field.Label>
      </Field.Root>
      <Field.Root className="flex-row items-center">
        <Switch
          checked={
            generalSettings?.isHideQueryParamsEnabled ??
            defaultSettings.general.isHideQueryParamsEnabled
          }
          onCheckedChange={handleHideQueryParamsChange}
        />
        <Field.Label>
          {t("settings.sideMenu.general.hideQueryParams")}{" "}
          <MoreInfoTooltip>
            {t("settings.sideMenu.general.hideQueryParams.tooltip")}
          </MoreInfoTooltip>
        </Field.Label>
      </Field.Root>
      <Field.Container>
        <Field.Root className="flex-row items-center">
          <Switch
            checked={
              generalSettings?.rememberUser?.isEnabled ??
              (isDefined(generalSettings?.isNewResultOnRefreshEnabled)
                ? !generalSettings?.isNewResultOnRefreshEnabled
                : false)
            }
            onCheckedChange={toggleRememberUser}
          />
          <Field.Label>
            {t("settings.sideMenu.general.rememberUser")}{" "}
            <MoreInfoTooltip>
              {t("settings.sideMenu.general.rememberUser.tooltip")}
            </MoreInfoTooltip>
          </Field.Label>
        </Field.Root>
        {(generalSettings?.rememberUser?.isEnabled ??
          (isDefined(generalSettings?.isNewResultOnRefreshEnabled)
            ? !generalSettings?.isNewResultOnRefreshEnabled
            : false)) && (
          <Field.Root>
            <Field.Label>
              {t("settings.sideMenu.general.rememberUser.storage")}
              <MoreInfoTooltip>
                <div className="flex flex-col gap-2">
                  <p>
                    <T
                      keyName="settings.sideMenu.general.rememberUser.storage.session.tooltip"
                      params={{
                        tag: <Badge />,
                      }}
                    />
                  </p>
                  <p>
                    <T
                      keyName="settings.sideMenu.general.rememberUser.storage.local.tooltip"
                      params={{
                        tag: <Badge />,
                      }}
                    />
                  </p>
                </div>
              </MoreInfoTooltip>
            </Field.Label>
            <BasicSelect
              value={generalSettings?.rememberUser?.storage}
              defaultValue={defaultSettings.general.rememberUser.storage}
              onChange={updateRememberUserStorage}
              items={rememberUserStorages}
            />
          </Field.Root>
        )}
      </Field.Container>
      <Accordion.Root>
        <Accordion.Item>
          <Accordion.Trigger>
            {t("settings.sideMenu.general.systemMessages")}
          </Accordion.Trigger>
          <Accordion.Panel>
            <SystemMessagesForm
              systemMessages={generalSettings?.systemMessages}
              onSystemMessagesChange={updateSystemMessages}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};
