import { DropdownList } from "@/components/DropdownList";
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { T, useTranslate } from "@tolgee/react";
import { isDefined } from "@typebot.io/lib/utils";
import {
  defaultSettings,
  rememberUserStorages,
} from "@typebot.io/settings/constants";
import type { Settings, SystemMessages } from "@typebot.io/settings/schemas";
import React from "react";
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
  const keyBg = useColorModeValue(undefined, "gray.600");
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
    <Stack spacing={6}>
      <SwitchWithLabel
        label={t("settings.sideMenu.general.prefillInput")}
        initialValue={
          generalSettings?.isInputPrefillEnabled ??
          defaultSettings.general.isInputPrefillEnabled
        }
        onCheckChange={handleInputPrefillChange}
        moreInfoContent={t("settings.sideMenu.general.prefillInput.tooltip")}
      />
      <SwitchWithLabel
        label={t("settings.sideMenu.general.hideQueryParams")}
        initialValue={
          generalSettings?.isHideQueryParamsEnabled ??
          defaultSettings.general.isHideQueryParamsEnabled
        }
        onCheckChange={handleHideQueryParamsChange}
        moreInfoContent={t("settings.sideMenu.general.hideQueryParams.tooltip")}
      />
      <SwitchWithRelatedSettings
        label={t("settings.sideMenu.general.rememberUser")}
        moreInfoContent={t("settings.sideMenu.general.rememberUser.tooltip")}
        initialValue={
          generalSettings?.rememberUser?.isEnabled ??
          (isDefined(generalSettings?.isNewResultOnRefreshEnabled)
            ? !generalSettings?.isNewResultOnRefreshEnabled
            : false)
        }
        onCheckChange={toggleRememberUser}
      >
        <FormControl as={HStack} justifyContent="space-between">
          <FormLabel mb="0">
            {t("settings.sideMenu.general.rememberUser.storage")}{" "}
            <MoreInfoTooltip>
              <Stack>
                <Text>
                  <T
                    keyName="settings.sideMenu.general.rememberUser.storage.session.tooltip"
                    params={{
                      tag: <Tag size="sm" bgColor={keyBg} />,
                    }}
                  />
                </Text>
                <Text>
                  <T
                    keyName="settings.sideMenu.general.rememberUser.storage.local.tooltip"
                    params={{
                      tag: <Tag size="sm" bgColor={keyBg} />,
                    }}
                  />
                </Text>
              </Stack>
            </MoreInfoTooltip>
          </FormLabel>
          <DropdownList
            currentItem={generalSettings?.rememberUser?.storage ?? "session"}
            onItemSelect={updateRememberUserStorage}
            items={rememberUserStorages}
          ></DropdownList>
        </FormControl>
      </SwitchWithRelatedSettings>
      <Accordion allowToggle>
        <AccordionItem>
          <AccordionButton justifyContent="space-between">
            {t("settings.sideMenu.general.systemMessages")}
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <SystemMessagesForm
              systemMessages={generalSettings?.systemMessages}
              onSystemMessagesChange={updateSystemMessages}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Stack>
  );
};
