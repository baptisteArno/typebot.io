import { DropdownList } from "@/components/DropdownList";
import { GlobeIcon } from "@/components/icons";
import { HStack, IconButton, Text, useColorModeValue } from "@chakra-ui/react";
import {
  getLocaleDisplayName,
  getLocaleFlagEmoji,
} from "@typebot.io/lib/localization";
import React from "react";

interface LocaleSwitcherProps {
  currentLocale: string;
  availableLocales: string[];
  onLocaleChange: (locale: string) => void;
  variant?: "compact" | "full";
}

export const LocaleSwitcher = ({
  currentLocale,
  availableLocales,
  onLocaleChange,
  variant = "compact",
}: LocaleSwitcherProps) => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  if (availableLocales.length <= 1) {
    return null;
  }

  const localeItems = availableLocales.map((locale) => ({
    label: `${getLocaleFlagEmoji(locale)} ${getLocaleDisplayName(locale)}`,
    value: locale,
  }));

  if (variant === "compact") {
    return (
      <HStack
        spacing={1}
        px={2}
        py={1}
        borderWidth={1}
        borderColor={borderColor}
        rounded="md"
        _hover={{ bg: hoverBg }}
        cursor="pointer"
      >
        <Text fontSize="sm">{getLocaleFlagEmoji(currentLocale)}</Text>
        <Text fontSize="xs" fontWeight="medium">
          {currentLocale.toUpperCase()}
        </Text>
        <DropdownList
          currentItem={currentLocale}
          onItemSelect={onLocaleChange}
          items={localeItems}
          placeholder=""
        />
      </HStack>
    );
  }

  return (
    <HStack>
      <IconButton
        icon={<GlobeIcon />}
        aria-label="Switch language"
        variant="ghost"
        size="sm"
      />
      <DropdownList
        currentItem={currentLocale}
        onItemSelect={onLocaleChange}
        items={localeItems}
        placeholder="Select language"
      />
    </HStack>
  );
};
