import { DropdownList } from "@/components/DropdownList";
import { MoreInfoTooltip } from "@/components/MoreInfoTooltip";
import { SwitchWithRelatedSettings } from "@/components/SwitchWithRelatedSettings";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { trpc } from "@/lib/trpc";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Progress,
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

// Chat limit types available
const chatLimitTypes = ["daily", "weekly", "monthly", "total"] as const;

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
  const { typebot } = useTypebot();

  const { data: statsData } = trpc.analytics.getStats.useQuery(
    {
      typebotId: typebot?.id as string,
      timeFilter: "allTime",
    },
    {
      enabled: !!typebot?.id,
    },
  );

  const resultsCount = statsData?.stats.totalViews ?? 0;

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

  const toggleChatLimits = (isEnabled: boolean) =>
    onGeneralSettingsChange({
      ...generalSettings,
      chatLimits: {
        ...generalSettings?.chatLimits,
        isEnabled,
        limit:
          generalSettings?.chatLimits?.limit ??
          defaultSettings.general.chatLimits.limit,
        limitType:
          generalSettings?.chatLimits?.limitType ??
          defaultSettings.general.chatLimits.limitType,
      },
    });

  const updateChatLimitValue = (limit: number) =>
    onGeneralSettingsChange({
      ...generalSettings,
      chatLimits: {
        ...generalSettings?.chatLimits,
        limit,
      },
    });

  const updateChatLimitType = (limitType: (typeof chatLimitTypes)[number]) =>
    onGeneralSettingsChange({
      ...generalSettings,
      chatLimits: {
        ...generalSettings?.chatLimits,
        limitType,
      },
    });

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
      <SwitchWithRelatedSettings
        label={t("settings.sideMenu.general.chatLimits.enable")}
        moreInfoContent={t(
          "settings.sideMenu.general.chatLimits.enable.tooltip",
        )}
        initialValue={
          generalSettings?.chatLimits?.isEnabled ??
          defaultSettings.general.chatLimits.isEnabled
        }
        onCheckChange={toggleChatLimits}
      >
        <Flex direction="column" gap={4}>
          <FormControl>
            <FormLabel>
              {t("settings.sideMenu.general.chatLimits.limit")}
            </FormLabel>
            <HStack>
              <NumberInput
                value={
                  generalSettings?.chatLimits?.limit ??
                  defaultSettings.general.chatLimits.limit
                }
                onChange={(_, limit) => updateChatLimitValue(limit)}
                min={0}
                max={10000}
                step={10}
                width="100%"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <DropdownList
                currentItem={
                  generalSettings?.chatLimits?.limitType ??
                  defaultSettings.general.chatLimits.limitType
                }
                onItemSelect={updateChatLimitType}
                items={chatLimitTypes}
                width="auto"
              />
            </HStack>
          </FormControl>
          <Box>
            <Progress
              value={
                (resultsCount / (generalSettings?.chatLimits?.limit ?? 1)) * 100
              }
              colorScheme="green"
              size="sm"
              hasStripe
              isAnimated
              borderRadius="md"
            />
            <Text
              fontSize="sm"
              mt={2}
              textAlign="center"
              color={
                resultsCount > (generalSettings?.chatLimits?.limit ?? 0)
                  ? "red.500"
                  : "inherit"
              }
            >
              {t("settings.sideMenu.general.chatLimits.currentUsage", {
                count: resultsCount,
                limit: generalSettings?.chatLimits?.limit,
              })}
            </Text>
          </Box>
        </Flex>
      </SwitchWithRelatedSettings>
    </Stack>
  );
};
