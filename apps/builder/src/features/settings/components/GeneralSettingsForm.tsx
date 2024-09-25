import { DropdownList } from "@/components/DropdownList";
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import {
  FormControl,
  FormLabel,
  HStack,
  Stack,
  Tag,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { isDefined } from "@typebot.io/lib/utils";
import {
  defaultSettings,
  rememberUserStorages,
} from "@typebot.io/settings/constants";
import type { Settings } from "@typebot.io/settings/schemas";
import React from "react";

type Props = {
  generalSettings: Settings["general"] | undefined;
  onGeneralSettingsChange: (generalSettings: Settings["general"]) => void;
};

export const GeneralSettingsForm = ({
  generalSettings,
  onGeneralSettingsChange,
}: Props) => {
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

  return (
    <Stack spacing={6}>
      <SwitchWithLabel
        label="Prefill input"
        initialValue={
          generalSettings?.isInputPrefillEnabled ??
          defaultSettings.general.isInputPrefillEnabled
        }
        onCheckChange={handleInputPrefillChange}
        moreInfoContent="Inputs are automatically pre-filled whenever their associated variable has a value"
      />
      <SwitchWithLabel
        label="Hide query params on bot start"
        initialValue={
          generalSettings?.isHideQueryParamsEnabled ??
          defaultSettings.general.isHideQueryParamsEnabled
        }
        onCheckChange={handleHideQueryParamsChange}
        moreInfoContent="If your URL contains query params, they will be automatically hidden when the bot starts."
      />
      <SwitchWithRelatedSettings
        label={"Remember user"}
        moreInfoContent="If enabled, the chat state will be restored if the user comes back after exiting."
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
            Storage:&nbsp;
            <MoreInfoTooltip>
              <Stack>
                <Text>
                  Choose{" "}
                  <Tag size="sm" bgColor={keyBg}>
                    session
                  </Tag>{" "}
                  to remember the user as long as he does not closes the tab or
                  the browser.
                </Text>
                <Text>
                  Choose{" "}
                  <Tag size="sm" bgColor={keyBg}>
                    local
                  </Tag>{" "}
                  to remember the user forever on the same device.
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
    </Stack>
  );
};
