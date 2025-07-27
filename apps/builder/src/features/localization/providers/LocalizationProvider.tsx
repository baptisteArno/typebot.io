import { useTypebot } from "@/features/editor/providers/TypebotProvider";
import { localizationService } from "@typebot.io/lib/localization";
import type { LocaleContext } from "@typebot.io/lib/localization";
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface LocalizationContextType extends LocaleContext {
  setCurrentLocale: (locale: string) => void;
  isLocalizationEnabled: boolean;
  translationMode: boolean;
  setTranslationMode: (enabled: boolean) => void;
  getTranslationStatus: (
    content: any,
  ) => Record<string, { completeness: number; hasUntranslated: boolean }>;
  resolveContent: <T extends Record<string, any>>(
    content: T & { localizations?: Record<string, Partial<T>> },
    locale?: string,
  ) => T;
}

const LocalizationContext = createContext<LocalizationContextType | null>(null);

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider = ({
  children,
}: LocalizationProviderProps) => {
  const { typebot } = useTypebot();
  const [translationMode, setTranslationMode] = useState(false);

  // Parse typebot localization settings
  const defaultLocale = typebot?.defaultLocale || "en";
  const supportedLocales = Array.isArray(typebot?.supportedLocales)
    ? typebot.supportedLocales
    : JSON.parse(typebot?.supportedLocales || '["en"]');
  const localeDetectionConfig =
    typeof typebot?.localeDetectionConfig === "string"
      ? JSON.parse(typebot.localeDetectionConfig || "{}")
      : typebot?.localeDetectionConfig || {};

  const isLocalizationEnabled = localeDetectionConfig.enabled || false;

  const [currentLocale, setCurrentLocale] = useState<string>(defaultLocale);

  const getTranslationStatus = (content: any) => {
    return localizationService.getTranslationStatus(content, supportedLocales);
  };

  const resolveContent = <T extends Record<string, any>>(
    content: T & { localizations?: Record<string, Partial<T>> },
    locale?: string,
  ): T => {
    const targetLocale = locale || currentLocale;
    return localizationService.resolveContent(
      content,
      targetLocale,
      defaultLocale,
    );
  };

  const contextValue: LocalizationContextType = {
    currentLocale,
    availableLocales: supportedLocales,
    fallbackLocale: defaultLocale,
    setCurrentLocale,
    isLocalizationEnabled,
    translationMode,
    setTranslationMode,
    getTranslationStatus,
    resolveContent,
  };

  return (
    <LocalizationContext.Provider value={contextValue}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error(
      "useLocalization must be used within a LocalizationProvider",
    );
  }
  return context;
};

// Hook for translation status of specific content
export const useTranslationStatus = (content: any) => {
  const { getTranslationStatus } = useLocalization();

  if (!content) {
    return {};
  }

  return getTranslationStatus(content);
};
