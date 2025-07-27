import { DropdownList } from "@/components/DropdownList";
import { CopyIcon } from "@/components/icons";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  getLocaleDisplayName,
  getLocaleFlagEmoji,
} from "@typebot.io/lib/localization";
import React, { type ReactNode } from "react";
import {
  useLocalization,
  useTranslationStatus,
} from "../providers/LocalizationProvider";
import { TranslationStatusIndicator } from "./TranslationStatusIndicator";

interface TranslationPopoverTabsProps {
  content: any;
  onContentChange: (content: any) => void;
  children: (props: {
    currentLocale: string;
    content: any;
    onChange: (updates: any) => void;
  }) => ReactNode;
}

export const TranslationPopoverTabs = ({
  content,
  onContentChange,
  children,
}: TranslationPopoverTabsProps) => {
  const {
    currentLocale,
    availableLocales,
    fallbackLocale,
    isLocalizationEnabled,
    setCurrentLocale,
  } = useLocalization();

  const translationStatus = useTranslationStatus(content);
  const tabBg = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  if (!isLocalizationEnabled || availableLocales.length <= 1) {
    // Single locale mode
    return (
      <Box>
        {children({
          currentLocale: fallbackLocale,
          content,
          onChange: onContentChange,
        })}
      </Box>
    );
  }

  const handleLocaleTabChange = (index: number) => {
    const newLocale = availableLocales[index];
    setCurrentLocale(newLocale);
  };

  const handleContentChange = (locale: string, updates: any) => {
    const newContent = { ...content };

    if (locale === fallbackLocale) {
      // Update default content
      Object.assign(newContent, updates);
    } else {
      // Update localized content
      if (!newContent.localizations) {
        newContent.localizations = {};
      }
      if (!newContent.localizations[locale]) {
        newContent.localizations[locale] = {};
      }
      Object.assign(newContent.localizations[locale], updates);
    }

    onContentChange(newContent);
  };

  const handleCopyFromDefault = (targetLocale: string) => {
    if (targetLocale === fallbackLocale) return;

    const defaultValues: any = {};

    // Copy relevant fields from default content
    if (content.html !== undefined) defaultValues.html = content.html;
    if (content.richText !== undefined)
      defaultValues.richText = content.richText;
    if (content.plainText !== undefined)
      defaultValues.plainText = content.plainText;
    if (content.content !== undefined) defaultValues.content = content.content;
    if (content.url !== undefined) defaultValues.url = content.url;
    if (content.clickLink !== undefined)
      defaultValues.clickLink = content.clickLink;

    handleContentChange(targetLocale, defaultValues);
  };

  const getContentForLocale = (locale: string) => {
    if (locale === fallbackLocale) {
      return content;
    }

    const localization = content.localizations?.[locale] || {};
    return {
      ...content,
      ...localization,
    };
  };

  const currentTabIndex = availableLocales.indexOf(currentLocale);

  return (
    <VStack spacing={3} align="stretch">
      <Tabs
        index={currentTabIndex}
        onChange={handleLocaleTabChange}
        variant="enclosed"
        size="sm"
      >
        <TabList bg={tabBg} rounded="md" p={1}>
          {availableLocales.map((locale) => (
            <Tab
              key={locale}
              fontSize="xs"
              fontWeight="medium"
              _selected={{
                bg: "white",
                borderColor: borderColor,
                shadow: "sm",
              }}
            >
              <HStack spacing={1}>
                <Text>{getLocaleFlagEmoji(locale)}</Text>
                <Text>{locale.toUpperCase()}</Text>
                {translationStatus[locale] && (
                  <TranslationStatusIndicator
                    completeness={translationStatus[locale].completeness}
                    size="xs"
                  />
                )}
              </HStack>
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {availableLocales.map((locale) => (
            <TabPanel key={locale} px={0} py={3}>
              <VStack spacing={3} align="stretch">
                {locale !== fallbackLocale && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Translating to {getLocaleDisplayName(locale)}
                    </Text>
                    <Tooltip
                      label={`Copy content from ${getLocaleDisplayName(fallbackLocale)}`}
                    >
                      <IconButton
                        icon={<CopyIcon />}
                        size="xs"
                        variant="ghost"
                        aria-label="Copy from default"
                        onClick={() => handleCopyFromDefault(locale)}
                      />
                    </Tooltip>
                  </HStack>
                )}

                {children({
                  currentLocale: locale,
                  content: getContentForLocale(locale),
                  onChange: (updates) => handleContentChange(locale, updates),
                })}
              </VStack>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

// Simplified locale selector for smaller spaces
export const LocaleSelector = ({
  value,
  onChange,
  availableLocales,
}: {
  value: string;
  onChange: (locale: string) => void;
  availableLocales: string[];
}) => {
  if (availableLocales.length <= 1) return null;

  return (
    <DropdownList
      currentItem={value}
      onItemSelect={onChange}
      items={availableLocales.map((locale) => ({
        label: `${getLocaleFlagEmoji(locale)} ${getLocaleDisplayName(locale)}`,
        value: locale,
      }))}
    />
  );
};
