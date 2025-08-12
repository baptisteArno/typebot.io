import { DropdownList } from "@/components/DropdownList";
import { GlobeIcon } from "@/components/icons";
import { NumberInput } from "@/components/inputs";
import { SwitchWithLabel } from "@/components/inputs/SwitchWithLabel";
import { TextInput } from "@/components/inputs/TextInput";
import {
  Button,
  Flex,
  HStack,
  Stack,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useTranslate } from "@tolgee/react";
import {
  type LocaleDetectionConfig,
  LocaleDetectionMethod,
  type SupportedLocale,
  supportedLocales,
} from "@typebot.io/lib/localization";
import {
  getLocaleDisplayName,
  getLocaleFlagEmoji,
} from "@typebot.io/lib/localization";
import React, { useState } from "react";

interface LocalizationSettings {
  defaultLocale: string;
  supportedLocales: string[];
  localeDetectionConfig: LocaleDetectionConfig;
}

interface LocalizationSettingsFormProps {
  localizationSettings?: LocalizationSettings;
  onLocalizationSettingsChange: (settings: LocalizationSettings) => void;
}

export const LocalizationSettingsForm = ({
  localizationSettings,
  onLocalizationSettingsChange,
}: LocalizationSettingsFormProps) => {
  const { t } = useTranslate();
  const [selectedLocaleToAdd, setSelectedLocaleToAdd] = useState<string>("");

  const bgColor = useColorModeValue("gray.50", "gray.800");

  const settings: LocalizationSettings = {
    defaultLocale: localizationSettings?.defaultLocale ?? "en",
    supportedLocales: localizationSettings?.supportedLocales ?? ["en"],
    localeDetectionConfig: {
      enabled: localizationSettings?.localeDetectionConfig?.enabled ?? false,
      methods: localizationSettings?.localeDetectionConfig?.methods ?? [
        LocaleDetectionMethod.URL_PARAM,
        LocaleDetectionMethod.BROWSER_HEADER,
      ],
      fallbackLocale:
        localizationSettings?.localeDetectionConfig?.fallbackLocale ?? "en",
      urlParamName:
        localizationSettings?.localeDetectionConfig?.urlParamName ?? "locale",
      pathSegmentIndex:
        localizationSettings?.localeDetectionConfig?.pathSegmentIndex ?? 0,
    },
  };

  const updateSettings = (updates: Partial<LocalizationSettings>) => {
    onLocalizationSettingsChange({
      ...settings,
      ...updates,
    });
  };

  const updateDetectionConfig = (updates: Partial<LocaleDetectionConfig>) => {
    updateSettings({
      localeDetectionConfig: {
        ...settings.localeDetectionConfig,
        ...updates,
      },
    });
  };

  const handleEnableLocalizationChange = (enabled: boolean) => {
    updateDetectionConfig({ enabled });
  };

  const handleDefaultLocaleChange = (defaultLocale: string) => {
    updateSettings({ defaultLocale });
  };

  const handleAddLocale = () => {
    if (
      selectedLocaleToAdd &&
      !settings.supportedLocales.includes(selectedLocaleToAdd)
    ) {
      updateSettings({
        supportedLocales: [...settings.supportedLocales, selectedLocaleToAdd],
      });
      setSelectedLocaleToAdd("");
    }
  };

  const handleRemoveLocale = (localeToRemove: string) => {
    if (
      settings.supportedLocales.length > 1 &&
      localeToRemove !== settings.defaultLocale
    ) {
      updateSettings({
        supportedLocales: settings.supportedLocales.filter(
          (l) => l !== localeToRemove,
        ),
      });
    }
  };

  const handleDetectionMethodChange = (methods: LocaleDetectionMethod[]) => {
    updateDetectionConfig({ methods });
  };

  const availableLocales = supportedLocales.filter(
    (locale) => !settings.supportedLocales.includes(locale),
  );

  const detectionMethodOptions = [
    {
      label: "URL Parameter (?locale=en)",
      value: LocaleDetectionMethod.URL_PARAM,
    },
    { label: "URL Path (/en/typebot)", value: LocaleDetectionMethod.URL_PATH },
    { label: "Browser Language", value: LocaleDetectionMethod.BROWSER_HEADER },
    { label: "User Preference", value: LocaleDetectionMethod.USER_PREFERENCE },
    { label: "Geolocation", value: LocaleDetectionMethod.GEOLOCATION },
  ];

  return (
    <Stack spacing={4}>
      <SwitchWithLabel
        label="Enable Multilingual Support"
        moreInfoContent="Allow users to view your typebot in different languages. Content can be translated per block."
        initialValue={settings.localeDetectionConfig.enabled}
        onCheckChange={handleEnableLocalizationChange}
      />

      {settings.localeDetectionConfig.enabled && (
        <>
          <Stack spacing={3}>
            <Text fontWeight="semibold">Default Language</Text>
            <DropdownList
              currentItem={settings.defaultLocale}
              onItemSelect={handleDefaultLocaleChange}
              items={settings.supportedLocales.map((locale) => ({
                label: `${getLocaleFlagEmoji(locale)} ${getLocaleDisplayName(locale)}`,
                value: locale,
              }))}
            />
          </Stack>

          <Stack spacing={3}>
            <Text fontWeight="semibold">Supported Languages</Text>
            <Flex flexWrap="wrap" gap={2}>
              {settings.supportedLocales.map((locale) => (
                <Tag key={locale} size="md" variant="solid" colorScheme="blue">
                  <TagLabel>
                    {getLocaleFlagEmoji(locale)} {getLocaleDisplayName(locale)}
                  </TagLabel>
                  {settings.supportedLocales.length > 1 &&
                    locale !== settings.defaultLocale && (
                      <TagCloseButton
                        onClick={() => handleRemoveLocale(locale)}
                      />
                    )}
                </Tag>
              ))}
            </Flex>

            {availableLocales.length > 0 && (
              <HStack>
                <DropdownList
                  currentItem={selectedLocaleToAdd}
                  onItemSelect={setSelectedLocaleToAdd}
                  items={[
                    { label: "Select language to add...", value: "" },
                    ...availableLocales.map((locale) => ({
                      label: `${getLocaleFlagEmoji(locale)} ${getLocaleDisplayName(locale)}`,
                      value: locale,
                    })),
                  ]}
                />
                <Button
                  size="sm"
                  onClick={handleAddLocale}
                  isDisabled={!selectedLocaleToAdd}
                  leftIcon={<GlobeIcon />}
                >
                  Add
                </Button>
              </HStack>
            )}
          </Stack>

          <Stack spacing={3}>
            <Text fontWeight="semibold">Language Detection</Text>
            <VStack bg={bgColor} p={4} rounded="md" spacing={3} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Detection methods (in priority order):
              </Text>

              {detectionMethodOptions.map((option) => (
                <SwitchWithLabel
                  key={option.value}
                  label={option.label}
                  initialValue={settings.localeDetectionConfig.methods.includes(
                    option.value,
                  )}
                  onCheckChange={(checked) => {
                    const newMethods = checked
                      ? [
                          ...settings.localeDetectionConfig.methods,
                          option.value,
                        ]
                      : settings.localeDetectionConfig.methods.filter(
                          (m) => m !== option.value,
                        );
                    handleDetectionMethodChange(newMethods);
                  }}
                />
              ))}

              {settings.localeDetectionConfig.methods.includes(
                LocaleDetectionMethod.URL_PARAM,
              ) && (
                <TextInput
                  label="URL Parameter Name"
                  defaultValue={settings.localeDetectionConfig.urlParamName}
                  onChange={(urlParamName) =>
                    updateDetectionConfig({ urlParamName })
                  }
                  placeholder="locale"
                />
              )}

              {settings.localeDetectionConfig.methods.includes(
                LocaleDetectionMethod.URL_PATH,
              ) && (
                <NumberInput
                  label="Path Segment Index"
                  defaultValue={settings.localeDetectionConfig.pathSegmentIndex}
                  onValueChange={(pathSegmentIndex) =>
                    updateDetectionConfig({
                      pathSegmentIndex:
                        typeof pathSegmentIndex === "number"
                          ? pathSegmentIndex
                          : 0,
                    })
                  }
                  min={0}
                  max={5}
                />
              )}

              <Text fontSize="sm" color="gray.500">
                Fallback:{" "}
                {getLocaleFlagEmoji(
                  settings.localeDetectionConfig.fallbackLocale,
                )}{" "}
                {getLocaleDisplayName(
                  settings.localeDetectionConfig.fallbackLocale,
                )}
              </Text>
            </VStack>
          </Stack>
        </>
      )}
    </Stack>
  );
};
